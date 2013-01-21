$(window).load(function() {

    var OPEN = 1;
    var CLOSED = 0;
    var schedule = {
        'tasks' : '',
        intervals : [],
        'length' : 0
    }

    var queue = [];
    var waiting = [];

    schedule.length = 100;
    schedule.tasks = []; //actual schedule
    schedule.intervals = []; //interval info

    //task block
    function Task(a, b, c){
        this.stat = a;
        this.time = b;
        this.priority = c;
        this.getStat = function(){ return this.stat; };
        this.setTime = function(a){ this.time = a; };
        this.getTime = function(){ return this.time; };
        this.getPriority = function(){ return this.priority; };
    };

    //time block
    function Interval(a, b){ 
        this.stat = a;
        this.size = b;
        this.available = b;
        this.getStat = function(){ return this.stat; };
        this.getSize = function(){ return this.size; };
        this.setSize = function(a){ this.available = a; };
        this.getAvailable = function(){ return this.available; };
    };

   //now lets fill in the times
    function getStart(){
        //give back the last added intervals
        return (schedule.intervals.length - 1);
    }

    function addTask(start, task){
        var limit = start + schedule.intervals[start].getSize();
        var curr = start;
        while(curr != limit){
            if(schedule.tasks[curr] == null){
                schedule.tasks[curr] = task;
                schedule.intervals[start].setSize(schedule.intervals[start].getAvailable()-task.getTime());
                return;
            }else{
                var time = schedule.tasks[curr].getTime();
                curr = (curr+time) % schedule.length;
            }
        }
    }

    //prints all schedule info
    function printInfo(schedule){
        console.log("Printing information");
        for(var i = 0; i < schedule.length; i ++){
            if(schedule[i] != null){
                console.log(schedule[i]);
                console.log(i);
            }
        }
    }
    //prints total fragmentation 
    function printFragmentationInfo(){
        console.log("==========Printing fragmentation information=========");
        var total = 0;
        for(var i = 0; i < schedule.intervals.length; i++){
            if(schedule.intervals[i] != null){
                if(schedule.intervals[i].getStat() == OPEN){
                    var available = schedule.intervals[i].getAvailable();
                    console.log('Location['+i+'] : ' + available + '/' + schedule.intervals[i].getSize());
                    total += available;
                }
            }
        }
        console.log("Total fragmentation: " + total);
    }

    function getSize(start, limit){
        //keep iterating until you hit either the limit or an object
        var size = 0;
        var curr = start;
        while(curr != limit){
            if(schedule.intervals[curr] == null){
                size++;
                curr = (curr+1) % schedule.length;
            }else{
                return size;
            }
        }
        return size;
    }

    function removeTask(task){
        var index = queue.indexOf(task);
        queue.splice(index, 1);
    }

    //first fit interval approach
    function addToSchedule(task){
        for(var i = 0; i < schedule.intervals.length; i++){
            if(schedule.intervals[i] != null){
                if(schedule.intervals[i].getStat() == OPEN){
                    if(task.getTime() <= schedule.intervals[i].getAvailable()){
                        addTask(i, task);
                        console.log("added task to interval");
                        console.log('task time : ' + task.getTime());
                        console.log('remaining : ' + schedule.intervals[i].getAvailable());
                        console.log(task);
                        console.log('location : ' + i);
                        return;
                    }
                }
            }
        }
        //if it doesn't fit
        console.log("pushed it to waiting ... ");
        console.log(task);
        waiting.push(task);
    }

    function bestFit(task){
        var frag_limit = 500; //set high
        var least_frag;
        //find the interval with least frag
        for(var i = 0; i < schedule.intervals.length; i++){
            if(schedule.intervals[i] != null){
                if(schedule.intervals[i].getStat() == OPEN){
                    var available = schedule.intervals[i].getAvailable();
                    var task_time = task.getTime();
                    var frag = available - task_time;
                    //console.log("TT: " + task_time + " AVAIL : " + available + " frag amt : " + frag);
                    if(frag <= frag_limit && frag >= 0){
                        frag_limit = frag;
                        least_frag = i;
                    }
                }
            }
        }
        //console.log("Least frag: " + least_frag);
    }

    //this could be optimized by keeping tack when adding intervals
    function getMaxInterval(){
        var max = 0;
        for(var i = 0; i < schedule.intervals.length; i++){
            if(schedule.intervals[i] != null){
                //what if none are open? this needs to be checked
                if(schedule.intervals[i].getStat() == OPEN){
                    var available = schedule.intervals[i].getAvailable();
                    if (available >= max)
                        max = available;
                    }
                }
            }
        return max;
    }

    function getClosestFit(task){
        var frag_limit = 500; //set high
        var least_frag;
        //find the interval with least frag
        for(var i = 0; i < schedule.intervals.length; i++){
            if(schedule.intervals[i] != null){
                if(schedule.intervals[i].getStat() == OPEN){
                    var available = schedule.intervals[i].getAvailable();
                    var task_time = task.getTime();
                    var frag = Math.abs(available - task_time);
                    if(frag <= frag_limit){
                        frag_limit = frag;
                        least_frag = i;
                    }
                }
            }
        }
        return least_frag;
    }

    //cuts the task down to the new size and adds rest to waiting.
    function taskSlice(task, new_time){
        //get the difference
        var diff = task.getTime() - new_time;
        var task_tail = new Task(OPEN,diff,task.getPriority());
        task.setTime(new_time);
        waiting.push(task_tail);
        //print the waiting.
        //console.log("Print waiting after slice");
        //printInfo(waiting);
        //console.log("Size of curr task after change : " + task.getTime());
    }

    function taskManager(task){
    /*okay, so some tasks are high pri but they do not friggin FIT. I don't want to always put it on waiting.
    maybe we'll only do it for tasks of certain size or if they meet a specific avail/size ratio.
    for now, we'll just focus on analyzing the task for best fit and splitting it
    if manager determines that task needs splitting, do best fit
    if it does not need splitting (so basically this is where we determien our algo. Then do first fit.*/
    
        //if bigger than all of the available slots
        if(task.getTime() > getMaxInterval()){
            //figure out a best fit to split.
            var closest = getClosestFit(task);
            var size = schedule.intervals[closest].getAvailable();
            console.log("Closest fit for this big boy is : " + closest + "With " + size);
            //get the size for this, and split it along.
            //if task is breakable (we can split)
            //only split if its NOT zero.
            if(size > 0) //threshhold for split
                taskSlice(task, size);
            else
                console.log("Sorry, no more space"); //checking full should happen elsewhere.
        }else{
            console.log("Nope we have fit");
        }
    }

    //finds the task to process based on length and priority
    function processQueue(queue, waiting){
        while(queue.length != 0){
            var max = 10;
            var high_pri = [];
            var shortest = [];
            for(var i = 0; i < queue.length; i++){
                var pri = queue[i].getPriority() 
                if(pri <= max) max = pri;
            }
            //now we have the max. Loop through to push highs into separate quque
            for(var i = 0; i < queue.length; i++){
                var pri = queue[i].getPriority() 
                if(pri == max) {
                    high_pri.push(queue[i]);
                }
            }
            if(high_pri.length > 1){
                var shortest = 100; //find the shortest value
                for(var i = 0; i < high_pri.length; i++){
                    var time = high_pri[i].getTime();
                    if(time <= shortest) shortest = time;
                }
                for(var i = 0; i < high_pri.length; i++){
                    var time = high_pri[i].getTime() 
                    if(time == shortest) {
                        //process this specific task.
                        removeTask(high_pri[i]);
                        taskManager(high_pri[i]); //tseting
                        addToSchedule(high_pri[i]);break; //first fit
                    }
                }
            }else{
                removeTask(high_pri[0]);
                taskManager(high_pri[0]); //tseting
                addToSchedule(high_pri[0]); //first fit
            }
        }
    }

    //set the closed limits
    schedule.intervals[50] = new Interval(CLOSED, 5);
    schedule.intervals[75] = new Interval(CLOSED, 15);
    schedule.intervals[95] = new Interval(CLOSED, 5);
    //sets up the rest of the intervals
    var start_limit = getStart(); //start at unit 50
    var curr = start_limit + schedule.intervals[start_limit].getSize();
    while (curr != start_limit){
        if(schedule.intervals[curr] == null){
            var size = getSize(curr, start_limit);
            schedule.intervals[curr] = new Interval(OPEN, size);
            curr = (curr+size) % schedule.length;
        }else{
            var time = schedule.intervals[curr].getSize();
            curr = (curr+time) % schedule.length;
        }
    }
    //initial print
    printInfo(schedule.intervals);
    //now lets add a bunch of tasks to the schedule
    /*addTask(55, new Task(OPEN, 20, 0));
    printInfo(schedule.tasks);
    printInfo(schedule.intervals);*/

    queue.push(new Task(OPEN, 10, 5));
    queue.push(new Task(OPEN, 10, 4));
    queue.push(new Task(OPEN, 10, 0)); //testing split
    queue.push(new Task(OPEN, 2, 5));
    queue.push(new Task(OPEN, 1, 2));
    queue.push(new Task(OPEN, 5, 5));
    queue.push(new Task(OPEN, 5, 5));
    queue.push(new Task(OPEN, 30, 5));

    //these should be in waiting.
    queue.push(new Task(OPEN, 100, 5));
    queue.push(new Task(OPEN, 75, 5));
    queue.push(new Task(OPEN, 75, 5));
    processQueue(queue, waiting);
    printInfo(schedule.intervals);
    console.log("print waiting");
    printInfo(waiting);
    printFragmentationInfo();
});

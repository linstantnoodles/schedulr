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
                        console.log('Location : ' + i);
                        return;
                    }
                }
            }
        }

        console.log("pushed it to waiting ... ");
        console.log(task);
        waiting.push(task);
    }

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
                        addToSchedule(high_pri[i]);break;
                    }
                }
            }else{
                removeTask(high_pri[0]);
                addToSchedule(high_pri[0]);
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
    queue.push(new Task(OPEN, 10, 0));
    queue.push(new Task(OPEN, 2, 5));
    queue.push(new Task(OPEN, 1, 2));

    processQueue(queue, waiting);
    printInfo(schedule.intervals);
    console.log("print waiting");
    printInfo(waiting);
});

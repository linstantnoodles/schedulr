$(window).load(function() {

    var OPEN = 1;
    var CLOSED = 0;
    var schedule = {
        'tasks' : '',
        'intervals' : '',
        'length' : 0
    }

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
    };

   //now lets fill in the times
    function getStart(intervals){
        //give back the last added intervals
        return (intervals.length - 1);
    }

    function addTask(intervals, tasks, start, task){
        var limit = start + intervals[start].getSize();
        var curr = start;
        while(curr != limit){
            if(tasks[curr] == null){
                tasks[curr] = task;
                intervals[start].setSize(intervals[start].getSize()-task.getTime());
                return;
            }else{
                var time = tasks[curr].getTime();
                curr = (curr+time) % schedule.length;
            }
        }
    }
    //prints all schedule info
    function printInfo(schedule){
        for(var i = 0; i < schedule.length; i ++){
            if(schedule[i] != null){
                console.log(schedule[i]);
                console.log(i);
            }
        }
    }

    function getSize(intervals, len,  start, limit){
        //keep iterating until you hit either the limit or an object
        var size = 0;
        var curr = start;
        while(curr != limit){
            if(intervals[curr] == null){
                size++;
                curr = (curr+1) % len;
            }else{
                return size;
            }
        }
        return size;
    }

    //set the closed limits
    schedule.intervals[50] = new Interval(CLOSED, 5);
    schedule.intervals[75] = new Interval(CLOSED, 15);
    schedule.intervals[95] = new Interval(CLOSED, 5);
    //sets up the rest of the intervals
    var start_limit = getStart(schedule.intervals); //start at unit 50
    var curr = start_limit + schedule.intervals[start_limit].getSize();
    while (curr != start_limit){
        if(schedule.intervals[curr] == null){
            var size = getSize(schedule.intervals, schedule.length, curr, start_limit);
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
    addTask(schedule.intervals, schedule.tasks, 55, new Task(OPEN, 20, 0));
    printInfo(schedule.tasks);
    printInfo(schedule.intervals);
});

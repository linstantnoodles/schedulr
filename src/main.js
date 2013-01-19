$(window).load(function() {

    var OPEN = 1;
    var CLOSED = 0;
    var schedule_length = 100;
    var schedule_page = [];

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
        this.getStat = function(){ return this.stat; };
        this.getSize = function(){ return this.size; };
    };

   //now lets fill in the times
    function getStart(schedule, len){
        for(var i = 0; i < len; i++){
            if (schedule[i] != null)
                return i;
        }
        return 0;
    }

    //prints all schedule info
    function printInfo(schedule){
        for(var i = 0; i < schedule.length; i ++){
            if(schedule[i] != null)
                console.log(schedule[i]);
        }
    }

    function getSize(schedule_page, len,  start, limit){
        //keep iterating until you hit either the limit or an object
        var size = 0;
        var curr = start;
        while(curr != limit){
            if(schedule_page[curr] == null){
                size++;
                curr = (curr+1) % len;
            }else{
                return size;
            }
        }
        return size;
    }

    //set the closed limits
    schedule_page[50] = new Interval(CLOSED, 5);
    schedule_page[75] = new Interval(CLOSED, 10);
    schedule_page[95] = new Interval(CLOSED, 5);

    //sets up the rest of the intervals
    var start_limit = getStart(schedule_page, schedule_length); //start at unit 50
    var curr = start_limit + schedule_page[start_limit].getSize();

    while (curr != start_limit){
        if(schedule_page[curr] == null){
            var size = getSize(schedule_page, schedule_length, curr, start_limit);
            schedule_page[curr] = new Interval(OPEN, size);
            curr = (curr+size) % schedule_length;
        }else{
            var time = schedule_page[curr].getSize();
            curr = (curr+time) % schedule_length;
        }
    }
    //initial print
    printInfo(schedule_page);

    //now lets add a bunch of tasks to the schedule
});

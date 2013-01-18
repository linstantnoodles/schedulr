$(window).load(function() {
    var OPEN = 1;
    var CLOSED = 0;

    function Task(a, b, c){ 
        this.stat = a;
        this.time = b;
        this.priority = c;
        this.getStat = function(){ return this.stat; };
        this.getTime = function(){ return this.time; };
        this.getPriority = function(){ return this.priority; };
    };

    var schedule_length = 100;
    var schedule_page = [];

    //set the closed limits
    schedule_page[50] = new Task(CLOSED, 5, 0);
    schedule_page[75] = new Task(CLOSED, 10, 0);
    //now lets fill in the times
    function getStart(schedule, len){
        for(var i = 0; i < len; i++){
            if (schedule[i] != null)
                return i;
        }
        return 0;
    }

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

    var start_limit = getStart(schedule_page, schedule_length); //start at unit 50
    var curr = start_limit + schedule_page[start_limit].getTime();

    while (curr != start_limit){ 
        if(schedule_page[curr] == null){
            //there is nothing here. Create a new page
            var size = getSize(schedule_page, schedule_length, curr, start_limit);
            schedule_page[curr] = new Task(OPEN, size, 0);
            curr = (curr+size) % schedule_length;
        }else{
            //there is an object here, open or closed. Lets move along and update curr.
            var time = schedule_page[curr].getTime();
            curr = (curr+time) % schedule_length;
        }
    }
        printInfo(schedule_page);
});

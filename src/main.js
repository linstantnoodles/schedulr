$(window).load(function() {
    $(function() {
        var name = $( "#name" );
        var priority = $("#priority");
        var duration = $( "#duration" );
        var allFields = $( [] ).add( name ).add( priority ).add( duration );
        var tips = $( ".validateTips" );
        function updateTips( t ) {
          tips
            .text( t )
            .addClass( "ui-state-highlight" );
          setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
          }, 500 );
        }
        function checkLength( o, n, min, max ) {
          if ( o.val().length > max || o.val().length < min ) {
            o.addClass( "ui-state-error" );
            updateTips( "Length of " + n + " must be between " +
              min + " and " + max + "." );
            return false;
          } else {
            return true;
          }
        }
        function checkRegexp( o, regexp, n ) {
          if ( !( regexp.test( o.val() ) ) ) {
            o.addClass( "ui-state-error" );
            updateTips( n );
            return false;
          } else {
            return true;
          }
        }
        $( "#dialog-form" ).dialog({
          autoOpen: false,
          height: 300,
          width: 350,
          modal: true,
          buttons: {
            "Create an account": function() {
              var bValid = true;
              //allFields.removeClass( "ui-state-error" );
              /*bValid = bValid && checkLength( name, "username", 3, 16 );
              bValid = bValid && checkLength( email, "email", 6, 80 );
              bValid = bValid && checkLength( password, "password", 5, 16 );
              bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
              // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
              bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
              bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
                */
              if ( bValid ) {
                updateSchedule(
                    parseInt(duration.val()),
                    parseInt(priority.val())
                );
                //printInfo(schedule.tasks);
                $( this ).dialog( "close" );
              }
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          },
          close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
          }
        });
     
        $( "#create-user" )
          .button()
          .click(function() {
            $( "#dialog-form" ).dialog( "open" );
          });
    });
    //end of dialog box
    var OPEN = 1;
    var CLOSED = 0;
    var schedule = {
        'tasks' : '',
        intervals : [],
        'length' : 0
    }

    var queue = [];
    var waiting = [];

    schedule.length = 1440; //60 * 24
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
//    console.log(task);
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
                var shortest = 2000; //find the shortest value
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
                console.log(high_pri[0]);
                taskManager(high_pri[0]); //tseting
                addToSchedule(high_pri[0]); //first fit
            }
        }
    }

    function renderTasks(cal, schedule){
        console.log(cal);
        console.log("----------RENDERING----------");
        for(var i = 0; i < schedule.length; i ++){
            if(schedule[i] != null){
                console.log("adding");
                var task = schedule[i];
                var zone_start = i;
                console.log("STARTING : " + zone_start);
                var zone_end = zone_start + task.getTime();
                cal.addMarkedTimespan({
                    days: new Date(),
                    zones: [zone_start, zone_end],
                    css:   "blue_section",
                    html:  task.getTime() + " minute task" + "with " + task.getPriority() + " P",
                    type:  "dhx_time_block"
                });
            }
        }
    }

    function renderIntervals(cal, schedule){
        console.log(cal);
        for(var i = 0; i < schedule.length; i ++){
            if(schedule[i] != null){
                var interval = schedule[i];
                var zone_start = i;
                var zone_end = zone_start + interval.getSize();
                if(interval.getStat() == CLOSED){
                    cal.addMarkedTimespan({
                        days: new Date(),
                        zones: [zone_start, zone_end],
                        css:   "gray_section",
                        type:  "dhx_time_block"
                    });
                }
            }
        }
    }

    //100.200.150?
    function resetSchedule(){
        scheduler.deleteMarkedTimespan();
        //reprocess the intervals
        for(var i = 0; i < schedule.tasks.length; i ++){
            if(schedule.tasks[i] != null){
                /*var task = schedule.tasks[i];
                var zone_start = i;
                var zone_end = zone_start + task.getTime();
                scheduler.deleteMarkedTimespan({
                    days: new Date(),
                    zones: [zone_start, zone_end],
                }); */
                queue.push(schedule.tasks[i]);
                schedule.tasks[i] = null;
            }
        }
        for(var i = 0; i < schedule.intervals.length; i++){
            if(schedule.intervals[i] != null){
                if(schedule.intervals[i].getStat() == OPEN){
                    var size = schedule.intervals[i].getSize();
                    schedule.intervals[i].setSize(size);
                }
                }
            }
        console.log("CURRENT QUEUE ");
        printInfo(queue);
        }


    function updateSchedule(duration, priority){
         resetSchedule();
         queue.push(new Task(OPEN, duration, priority));
         processQueue(queue, waiting);
         renderTasks(scheduler, schedule.tasks);
         renderIntervals(scheduler, schedule.intervals);
         scheduler.updateView();
    }


    //set the closed limits. We may want this to be manual in the future.
    schedule.intervals[50] = new Interval(CLOSED, 5);
    schedule.intervals[75] = new Interval(CLOSED, 15);
    schedule.intervals[95] = new Interval(CLOSED, 100);
    schedule.intervals[200] = new Interval(CLOSED, 80);
    schedule.intervals[500] = new Interval(CLOSED, 5);
    schedule.intervals[900] = new Interval(CLOSED, 200);
    //sets up the rest of the intervals
    var start_limit = getStart(); //start at unit 50
    var curr = start_limit + schedule.intervals[start_limit].getSize();
    //alert("orginal len " + schedule.intervals.length);
    //creates the interval regions
    while(curr != start_limit){
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

    /*queue.push(new Task(OPEN, 100, 1));
    queue.push(new Task(OPEN, 200, 1));
    queue.push(new Task(OPEN, 150, 1));*/
   /* queue.push(new Task(OPEN, 100, 1));
    queue.push(new Task(OPEN, 30, 5));
    queue.push(new Task(OPEN, 40, 2));*/
    /*queue.push(new Task(OPEN, 10, 4));
    queue.push(new Task(OPEN, 10, 0)); //testing split
    queue.push(new Task(OPEN, 2, 5));
    queue.push(new Task(OPEN, 1, 2));
    queue.push(new Task(OPEN, 5, 5));
    queue.push(new Task(OPEN, 5, 5));
    queue.push(new Task(OPEN, 30, 5));*/

    //these should be in waiting.
    /*queue.push(new Task(OPEN, 100, 5));
    queue.push(new Task(OPEN, 75, 5));
    queue.push(new Task(OPEN, 75, 5));*/

    processQueue(queue, waiting);
    printInfo(schedule.intervals);
    console.log("print waiting");
    printInfo(waiting);
    printFragmentationInfo();

    //now we create the calendar and loop thru
    scheduler.init('scheduler_here',null,"day");
    renderTasks(scheduler, schedule.tasks);
    renderIntervals(scheduler, schedule.intervals);
    scheduler.updateView();
});

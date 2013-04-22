$(window).load(function() {
  //dialog handler
  $(function() {
    var name = $("#name"),
      priority = $("#priority"),
      duration = $("#duration"),
      allFields = $([]).add(name).add(priority).add(duration);

    $("#dialog-form").dialog({
      autoOpen : false,
      height : 300,
      width : 350,
      modal : true,
      buttons : {
        "Create an account" : function() {
          var bValid = true;
          if(bValid) {
            updateSchedule(parseInt(duration.val()), parseInt(priority.val()), name.val());
            $(this).dialog("close");
          }
        },
        Cancel : function() {
          $(this).dialog("close");
        }
      },
      close : function() {
        allFields.val("").removeClass("ui-state-error");
      }
    });
    $("#create-user").button().click(function() {
      $("#dialog-form").dialog("open");
    });
  });
  //end of dialog box
  var OPEN = 1,
      CLOSED = 0;
      
  var schedule = {
    'tasks' : '',
    intervals : [],
    'length' : 0
  }

  var queue = [];
  var waiting = [];

  schedule.length = 1440;
  //60 * 24
  schedule.tasks = [];
  //actual schedule
  schedule.intervals = [];
  //interval info

  //task block
  function Task(a, b, c, d) {
    this.stat = a;
    this.time = b;
    this.priority = c;
    this.description = d;
    this.getDescription = function() {
      return this.description;
    };
    this.getStat = function() {
      return this.stat;
    };
    this.setTime = function(a) {
      this.time = a;
    };
    this.getTime = function() {
      return this.time;
    };
    this.getPriority = function() {
      return this.priority;
    };
  };

  //time block
  function Interval(a, b) {
    this.stat = a;
    this.size = b;
    this.available = b;
    this.getStat = function() {
      return this.stat;
    };
    this.getSize = function() {
      return this.size;
    };
    this.setSize = function(a) {
      this.available = a;
    };
    this.getAvailable = function() {
      return this.available;
    };
  };

  //now lets fill in the times
  function getStart() {
    //give back the last added intervals
    return (schedule.intervals.length - 1);
  }

  function addTask(start, task) {
    var limit = start + schedule.intervals[start].getSize(),
        curr = start,
        available,
        time;
    while(curr != limit) {
      if(schedule.tasks[curr] == null) {
        schedule.tasks[curr] = task;
        available = schedule.intervals[start].getAvailable();
        schedule.intervals[start].setSize(available - task.getTime());
        return;
      } else {
        time = schedule.tasks[curr].getTime();
        curr = (curr + time) % schedule.length;
      }
    }
  }

  //prints all schedule info
  function printInfo(schedule) {
    console.log("Printing information");
    for(var i = 0; i < schedule.length; i++) {
      if(schedule[i] != null) {
        console.log(schedule[i]);
        console.log(i);
      }
    }
  }

  //prints total fragmentation
  function printFragmentationInfo() {
    console.log("=Printing fragmentation information=");
    var total = 0;
    for(var i = 0; i < schedule.intervals.length; i++) {
      if(schedule.intervals[i] != null) {
        if(schedule.intervals[i].getStat() == OPEN) {
          var available = schedule.intervals[i].getAvailable();
          console.log('Location[' + i + '] : ' + available + '/' + schedule.intervals[i].getSize());
          total += available;
        }
      }
    }
    console.log("Total fragmentation: " + total);
  }

  function getSize(start, limit) {
    //keep iterating until you hit either the limit or an object
    var size = 0,
        curr = start;
    while(curr != limit) {
      if(schedule.intervals[curr] == null) {
        size++;
        curr = (curr + 1) % schedule.length;
      } else {
        return size;
      }
    }
    return size;
  }

  function removeTask(task) {
    var index = queue.indexOf(task);
    queue.splice(index, 1);
  }

  //first fit interval approach
  function addToSchedule(task) {
    var i;
    for(i = 0; i < schedule.intervals.length; i++) {
      if(schedule.intervals[i] != null) {
        if(schedule.intervals[i].getStat() == OPEN) {
          if(task.getTime() <= schedule.intervals[i].getAvailable()) {
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
    //console.log("pushed it to waiting ... ");
    console.log(task);
    waiting.push(task);
  }

  function bestFit(task) {
    var frag_limit = 500,
        least_frag,
        available,
        task_time,
        frag,
        i;
    //find the interval with least frag
    for(var i = 0; i < schedule.intervals.length; i++) {
      if(schedule.intervals[i] != null) {
        if(schedule.intervals[i].getStat() == OPEN) {
          available = schedule.intervals[i].getAvailable();
          task_time = task.getTime();
          frag = available - task_time;
          //console.log("TT: " + task_time + " AVAIL : " + available + " frag amt : " + frag);
          if(frag <= frag_limit && frag >= 0) {
            frag_limit = frag;
            least_frag = i;
          }
        }
      }
    }
  }

  //this could be optimized by keeping tack when adding intervals
  function getMaxInterval() {
    var max = 0,
        available,
        i;
    for(i = 0; i < schedule.intervals.length; i++) {
      if(schedule.intervals[i] != null) {
        //what if none are open? this needs to be checked
        if(schedule.intervals[i].getStat() == OPEN) {
          available = schedule.intervals[i].getAvailable();
          if(available >= max)
            max = available;
        }
      }
    }
    return max;
  }

  function getClosestFit(task) {
    var frag_limit = 500,
        least_frag,
        available,
        task_time,
        frag,
        i;
    //find the interval with least frag
    for(i = 0; i < schedule.intervals.length; i++) {
      if(schedule.intervals[i] != null) {
        if(schedule.intervals[i].getStat() == OPEN) {
          available = schedule.intervals[i].getAvailable();
          task_time = task.getTime();
          frag = Math.abs(available - task_time);
          if(frag <= frag_limit) {
            frag_limit = frag;
            least_frag = i;
          }
        }
      }
    }
    return least_frag;
  }

  //cuts the task down to the new size and adds rest to waiting.
  function taskSlice(task, new_time) {
    var diff = task.getTime() - new_time;
        task_tail = new Task(OPEN, diff, task.getPriority(), task.getDescription());
    task.setTime(new_time);
    waiting.push(task_tail);
  }

  function taskManager(task) {
    var closest,
        size;
    if(task.getTime() > getMaxInterval()) {
      //figure out a best fit to split.
      closest = getClosestFit(task);
      size = schedule.intervals[closest].getAvailable();
      console.log("Closest fit for this big boy is : " + closest + "With " + size);
      //if task is breakable (we can split)
      //only split if its NOT zero.
      if(size > 0)//threshhold for split
        taskSlice(task, size);
      else
        console.log("Sorry, no more space");
      //checking full should happen elsewhere.
    } else {
      console.log("Nope we have fit");
    }
  }

  //finds the task to process based on length and priority
  function processQueue(queue, waiting) {
    var max_priority,
        high_pri,
        curr_priority,
        shortest_duration,
        time,
        i;
    while(queue.length != 0) {
      max_priority = 10, 
      high_pri = [];
      for(i = 0; i < queue.length; i++) {
        curr_priority = queue[i].getPriority();
        if(curr_priority < max_priority)
          max_priority = curr_priority;
      }
      //now we have the max. Loop through to push highs into separate quque
      for(i = 0; i < queue.length; i++) {
        if(queue[i].getPriority() == max_priority)
          high_pri.push(queue[i]);
      }
      //if more than one task with same priority
      if(high_pri.length > 1) {
        shortest_duration = 2000;
        //find the shortest_duration value
        for(i = 0; i < high_pri.length; i++) {
          time = high_pri[i].getTime();
          if(time < shortest_duration)
            shortest_duration = time;
        }

        for(i = 0; i < high_pri.length; i++) {
          if(high_pri[i].getTime() == shortest_duration) {
            handleTask(high_pri[i]);
            break;
          }
        }
      } else {
        handleTask(high_pri[0]);
      }
    }
  }

  function handleTask(task) {
    removeTask(task);
    taskManager(task);
    addToSchedule(task);
  }

  function renderTasks(cal, schedule) {
    var task,
        zone_end,
        i;
    //console.log("----------RENDERING----------");
    for(i = 0; i < schedule.length; i++) {
      if(schedule[i] != null) {
        console.log("adding");
        task = schedule[i], zone_start = i;
        //console.log("STARTING : " + zone_start);
        zone_end = zone_start + task.getTime();
        cal.addMarkedTimespan({
          days : new Date(),
          zones : [zone_start, zone_end],
          css : "blue_section",
          html : "Description: " + 
                 task.getDescription() + 
                 " Time: " + task.getTime() + 
                 " Priority: " + 
                 task.getPriority(),
          type : "dhx_time_block"
        });
      }
    }
  }

  function renderIntervals(cal, schedule) {
    var interval,
        i;
    console.log(cal);
    for(i = 0; i < schedule.length; i++) {
      if(schedule[i] != null) {
            interval = schedule[i], 
            zone_start = i, 
            zone_end = zone_start + interval.getSize();
        if(interval.getStat() == CLOSED) {
          cal.addMarkedTimespan({
            days : new Date(),
            zones : [zone_start, zone_end],
            css : "gray_section",
            type : "dhx_time_block"
          });
        }
      }
    }
  }

  function resetSchedule() {
    var size,
        i;
    //reset the scheduler ui
    scheduler.deleteMarkedTimespan();
    //clear the tasks and move to queue
    for(i = 0; i < schedule.tasks.length; i++) {
      if(schedule.tasks[i] != null) {
        queue.push(schedule.tasks[i]);
        schedule.tasks[i] = null;
      }
    }
    //reset the intervals
    for(i = 0; i < schedule.intervals.length; i++) {
      if(schedule.intervals[i] != null) {
        if(schedule.intervals[i].getStat() == OPEN) {
          size = schedule.intervals[i].getSize();
          schedule.intervals[i].setSize(size);
        }
      }
    }
  }

  function updateSchedule(duration, priority, description) {
    resetSchedule();
    queue.push(new Task(OPEN, duration, priority, description));
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
  var start_limit = getStart();
  //start at unit 50
  var curr = start_limit + schedule.intervals[start_limit].getSize();

  //creates the interval regions
  while(curr != start_limit) {
    if(schedule.intervals[curr] == null) {
      var size = getSize(curr, start_limit);
      schedule.intervals[curr] = new Interval(OPEN, size);
      curr = (curr + size) % schedule.length;
    } else {
      var time = schedule.intervals[curr].getSize();
      curr = (curr + time) % schedule.length;
    }
  }

  printInfo(schedule.intervals);
  processQueue(queue, waiting);
  printInfo(schedule.intervals);
  console.log("print waiting");
  printInfo(waiting);
  printFragmentationInfo();

  //now we create the calendar and loop thru
  scheduler.init('scheduler_here', null, "day");
  renderTasks(scheduler, schedule.tasks);
  renderIntervals(scheduler, schedule.intervals);
  scheduler.updateView();
});

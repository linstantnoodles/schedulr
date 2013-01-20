##Schedulr##

###About###
What if planning could be automated? The OS does a wonderful job prioritizing proccesses - why can't there be an app that does the same thing for your to-do list?

####Challenges####
* Unlike pure scheduling (process scheduling), we can't always run the highest priority job. 
* Preemption. We can split tasks. But not all tasks can or should be interrupted.
* Deadlines. Not all tasks have deadlines, so how do we handle the ones that do? If at all?
* Assuming equal priorities - do the shortest jobs first, longest jobs first, or the job that best fits our schedule?
* Starvation. Will we have tasks that never get put into the schedule?

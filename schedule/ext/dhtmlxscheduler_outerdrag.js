/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
scheduler.attachEvent("onTemplatesReady",function(){var a=new dhtmlDragAndDropObject,f=a.stopDrag,c;a.stopDrag=function(d){c=d||event;return f.apply(this,arguments)};a.addDragLanding(scheduler._els.dhx_cal_data[0],{_drag:function(d,a,f,h){if(!scheduler.checkEvent("onBeforeExternalDragIn")||scheduler.callEvent("onBeforeExternalDragIn",[d,a,f,h,c])){var i=scheduler.attachEvent("onEventCreated",function(b,a){if(!scheduler.callEvent("onExternalDragIn",[b,d,a]))this._drag_mode=this._drag_id=null,this.deleteEvent(b)}),
g=scheduler.getActionData(c),b={start_date:new Date(g.date)};if(scheduler.matrix&&scheduler.matrix[scheduler._mode]){var e=scheduler.matrix[scheduler._mode];b[e.y_property]=g.section;var j=scheduler._locate_cell_timeline(c);b.start_date=e._trace_x[j.x];b.end_date=scheduler.date.add(b.start_date,e.x_step,e.x_unit)}if(scheduler._props&&scheduler._props[scheduler._mode])b[scheduler._props[scheduler._mode].map_to]=g.section;scheduler.addEventNow(b);scheduler.detachEvent(i)}},_dragIn:function(a){return a},
_dragOut:function(){return this}})});

describe("Task", function() {

    var task = new Task(1,20,5);

    it("gets stat", function() {
        expect(task.getStat()).toEqual(1);
    });

    it("gets time", function() {
        expect(task.getTime()).toEqual(20);
    });

    it("gets priority", function() {
        expect(task.getPriority()).toEqual(5);
    });

});

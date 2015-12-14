/**
 * Created by Martin on 13-12-2015.
 */
// FIFO queue with extra spices
function Queue(){
    var queue  = [];
    var maxOffset = 10;
    var offset = 0;

    this.getLength = function(){
        return (queue.length - offset);
    };

    this.isEmpty = function(){
        return (this.getLength() == 0);
    };

    this.enqueue = function(item){
        queue.push(item);
    };

    this.dequeue = function(){
        if (this.getLength == 0) return undefined;
        var item = queue[offset];
        offset++;
        /*// Make queue shorter
        if(offset >= maxOffset){
            queue = queue.slice(offset);
            offset = 0;
        }*/
        return item;
    };

    // return the item at the specified position
    this.lookInto = function(queueOffset){
        if(offset + queueOffset < queue.length){
            return queue[offset + queueOffset]
        } else {
            return undefined
        }
    };
}

module.exports = Queue;
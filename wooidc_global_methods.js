Meteor.methods ({

//Method returning the domain of the clicked configured Web observatory node to be passed on to server for authorization.
//This method passes data from client to server.

       selectedWOnode: function(wonode) {
            woNode = wonode;
            return wonode;
       }


});


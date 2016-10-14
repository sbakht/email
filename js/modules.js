CORE.create_module("email-nav", function (sb) {
    return {
        init : function() {
            sb.onEvent(".email-nav_inbox", "click", function() {
                History.pushState({type: "state-open-inbox"}, null, "?inbox");
            });
            sb.onEvent(".email-nav_trash", "click", function() {
                History.pushState({type: "state-open-trash"}, null, "?trash");
            });

            sb.listen([
                "db-emails",
                "state-open-inbox",
                "state-open-trash",
            ]);
        },
        destroy : function () {
        },
        dbEmails : function(emails) {
           var unread = Object.filter(emails, email => email.unread && !email.trash)
           var countUnreadInbox = Object.keys(unread).length;
           sb.html(".email-nav_inbox .email-nav_counter", countUnreadInbox);

           var unread = Object.filter(emails, email => email.unread && email.trash)
           var countUnreadTrash = Object.keys(unread).length;
           sb.html(".email-nav_trash .email-nav_counter", countUnreadTrash);
        },
        stateOpenInbox : function() {
            sb.find(".nav--selected").removeClass("nav--selected");
            sb.find(".email-nav_inbox").addClass("nav--selected");
            sb.notify({
                type : "open-category",
                data : "inbox"
            });
        },
        stateOpenTrash : function() {
            sb.find(".nav--selected").removeClass("nav--selected");
            sb.find(".email-nav_trash").addClass("nav--selected");
            sb.notify({
                type : "open-category",
                data : "trash"
            });
        }
    }
});

CORE.create_module("catalog-control", function (sb) {
    var markSelectedEmailsAsRead = function() {
        sb.notify({ 
            type : "selected-emails-unread-state",
            data : false
        });
    };
    var markSelectedEmailsAsUnRead = function() {
        sb.notify({ 
            type : "selected-emails-unread-state",
            data : true
        });
    };
    var deleteSelectedEmails = function() {
        sb.notify({ 
            type : "delete-selected-emails"
        });
    };
    var deleteSelectedEmailsForever = function() {
        sb.notify({ 
            type : "delete-selected-emails-forever"
        });        
    };

    return {
        init : function() {
            sb.onEvent("#email-mark-as-read", "click", markSelectedEmailsAsRead);
            sb.onEvent("#email-mark-as-unread", "click", markSelectedEmailsAsUnRead);
            sb.onEvent("#email-delete", "click", deleteSelectedEmails);
            sb.onEvent("#email-delete-forever", "click", deleteSelectedEmailsForever);

            sb.listen([
                "open-category",
                "open-email"
            ]);
        },
        destroy : function () {
        },
        openCategory : function(category) {
            if(category === "inbox") {
                sb.show("#email-delete");
                sb.hide("#email-delete-forever");
            }else if(category === "trash"){
                sb.show("#email-delete-forever");
                sb.hide("#email-delete");
            }
            sb.show();
        },
        openEmail : function() {
            sb.hide();
        }
    }
});


CORE.create_module("email-catalog", function (sb) {
    var emails;
    var activeCategory;

    Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

    var openEmail = function(id) {
        sb.hide();
        sb.notify({
            type : "open-email",
            data : id
        });
    }
    var selectEmailCheckbox = function(e) {
        e.stopPropagation();
        if(e.currentTarget.checked) {
            sb.notify({
                type : "select-email-checkbox",
                data : e.currentTarget.getAttribute("data-email-id")
            });
        }else{
            sb.notify({
                type : "deselect-email-checkbox",
                data : e.currentTarget.getAttribute("data-email-id")
            });
        }
    }
    var getCategoryData = function() {
        if(activeCategory === "trash") {
            return Object.filter(emails, email => email.trash);
        }else{
            return Object.filter(emails, email => email.category === activeCategory && !email.trash);
        }
    }

    return {
        init : function() {
            activeCategory = "inbox";   
            sb.onEvent(".email-catalog_email", "click", function(e) {
                var id = e.currentTarget.getAttribute("data-email-id");
                History.pushState({type: "state-open-email", id: id}, null, "?id=" + id);
            });
            sb.onEvent(".email-catalog_email_checkbox", "click", selectEmailCheckbox);

            sb.listen([
                "db-emails",
                "open-category",
                "state-open-email",
            ]);
        },
        destroy : function () {
            sb.ignore(["db-emails", "open-category"]);
            emails = null;
        },
        dbEmails : function(data) {
            emails = data;
            sb.template(getCategoryData(activeCategory));
        },
        openCategory : function(category) {
            activeCategory = category;
            sb.render(getCategoryData(activeCategory));
        },
        stateOpenEmail : function(data) {
            openEmail(data.id);
        }
    }
});

CORE.create_module("email-container", function(sb) {
    var emails;
    return {
        init : function() {
            emails = [];
            sb.listen([
                "db-emails",
                "open-category",
                "open-email",
            ]);
        },
        destroy : function() {
            sb.ignore(["open-email","open-category"]);
        },
        dbEmails : function(data) {
            emails = data;
        },
        openCategory : function() {
            sb.hide();
        },
        openEmail : function(id) {
            sb.render(emails[id]);
        }
    }
});

CORE.create_module("db-emails", function(sb) {
    var emails;
    var selected;

    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    var notifyData = function() {
        sb.notify({
            type : "db-emails",
            data : emails
        });
    }

    var deleteSelectedEmails = function() {
        selected.forEach(function(id) {
            emails[id].trash = true;
        });
        notifyData();
    }
    var deleteSelectedEmailsForever = function() {
        selected.forEach(function(id) {
            delete emails[id];
        });
        notifyData();
    }
    var addNewEmail = function(email) {
        email.unread = true;
        email.date = Date.now();
        emails[guidGenerator()] = email;
        notifyData();
    } 
    var setEmailChecked = function(id) {
        selected.push(id);
        emails[id].checked = true;
    }
    var setEmailUnchecked = function(id) {
        var index = selected.indexOf(id);
        if(index > -1) {
           selected.splice(index, 1); 
        }else{
            throw Error("Unchecking email that was never added to selected");
        }
        emails[id].checked = false;
    }
    var setEmailRead = function(id) {
        emails[id].unread = false;
        notifyData();
    }
    var setEmailsUnreadState = function(unread) {
        selected.forEach(function(id) {
            emails[id].unread = unread;
        });
        notifyData();
    }

    return {
        init : function() {
            emails = {
                "someid" : {category: "inbox", unread : true, name : "Bob", email : "bob@example.com", body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget massa metus. Sed cursus mauris lectus, at consequat leo eleifend eleifend. Duis justo quam, auctor euismod nibh quis, pretium tempor augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse sodales id mi ac semper. Ut risus felis, molestie et libero vel, luctus gravida nibh. Proin posuere malesuada nisl vitae pharetra. Donec at condimentum urna. Etiam nec massa massa. Pellentesque libero nunc, ultricies ac scelerisque ac, eleifend non quam."},
                "someotherid" : {category: "inbox", name : "Bob", email : "bob@example.com", body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget massa metus. Sed cursus mauris lectus, at consequat leo eleifend eleifend. Duis justo quam, auctor euismod nibh quis, pretium tempor augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse sodales id mi ac semper. Ut risus felis, molestie et libero vel, luctus gravida nibh. Proin posuere malesuada nisl vitae pharetra. Donec at condimentum urna. Etiam nec massa massa. Pellentesque libero nunc, ultricies ac scelerisque ac, eleifend non quam."},
                "yayanotherid" : {category: "inbox", name : "Bob", email : "bob@example.com", body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget massa metus. Sed cursus mauris lectus, at consequat leo eleifend eleifend. Duis justo quam, auctor euismod nibh quis, pretium tempor augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse sodales id mi ac semper. Ut risus felis, molestie et libero vel, luctus gravida nibh. Proin posuere malesuada nisl vitae pharetra. Donec at condimentum urna. Etiam nec massa massa. Pellentesque libero nunc, ultricies ac scelerisque ac, eleifend non quam."},
            };
            selected = [];

            notifyData();
            sb.listen([
                "delete-selected-emails",
                "delete-selected-emails-forever",
                "generate-email",
                "select-email-checkbox",
                "deselect-email-checkbox",
                "selected-emails-unread-state",
                "open-email"
            ]);
        },
        destroy : function() {
        },
        deleteSelectedEmails : function() {
            deleteSelectedEmails();
        },
        deleteSelectedEmailsForever : function() {
            deleteSelectedEmailsForever();
        },
        generateEmail : function(email) {
            addNewEmail(email);
        },
        selectEmailCheckbox : function(id) {
           setEmailChecked(id);
        },
        deselectEmailCheckbox : function(id) {
            setEmailUnchecked(id);
        },
        selectedEmailsUnreadState : function(unread) {
            setEmailsUnreadState(unread);
        },
        openEmail : function(id) {
           setEmailRead(id); 
        }
    }
});

CORE.create_module("state", function (sb) {
    var updateState = function() {
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        History.log('statechange:', State.data, State.title, State.url);
        sb.notify({
            type : State.data.type,
            data : State.data
        });
    }

    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        updateState();
    });

    return {
        init : function() {
            updateState();
        },
        destroy : function() {
        }
    }
});

CORE.start_all();

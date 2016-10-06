CORE.create_module("email-nav", function (sb) {
    return {
        init : function() {
            sb.onEvent(".email-nav_inbox", "click", function() {
                sb.notify({
                    type : "open-catalog"
                });
            });
        },
        destroy : function () {
        }
    }
});

CORE.create_module("email-catalog", function (sb) {
    var emails;

    return {
        init : function() {
            sb.onEvent(".email-catalog_email", "click", this.openEmail.bind(this));

            sb.listen({
                "db-emails" : this.fetchEmails,
                "open-catalog" : this.render
            });
        },
        destroy : function () {
            sb.ignore(["db-emails", "open-catalog"]);
            emails = null;
        },
        fetchEmails : function(data) {
            emails = data;
            sb.template(emails);
        },
        openEmail : function(e) {
            sb.hide();
            sb.notify({
                type : "open-email",
                data : emails[e.currentTarget.getAttribute("data-email-id")]
            });
        },
        render : function() {
            sb.render(emails);
        }
    }
});

CORE.create_module("email-container", function(sb) {
    return {
        init : function() {
            sb.listen({
                "open-email" : sb.render,
                "open-catalog" : sb.hide
            });
        },
        destroy : function() {
            sb.ignore(["open-email","open-catalog"]);
        }
    }
});

CORE.create_module("db-emails", function(sb) {
    var emails;

    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    return {
        init : function() {
            emails =[ 
                {id: 0, unread : true, name : "Bob", email : "bob@example.com", body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget massa metus. Sed cursus mauris lectus, at consequat leo eleifend eleifend. Duis justo quam, auctor euismod nibh quis, pretium tempor augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse sodales id mi ac semper. Ut risus felis, molestie et libero vel, luctus gravida nibh. Proin posuere malesuada nisl vitae pharetra. Donec at condimentum urna. Etiam nec massa massa. Pellentesque libero nunc, ultricies ac scelerisque ac, eleifend non quam."},
                {id: 1, name : "Bob", email : "bob@example.com", body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget massa metus. Sed cursus mauris lectus, at consequat leo eleifend eleifend. Duis justo quam, auctor euismod nibh quis, pretium tempor augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse sodales id mi ac semper. Ut risus felis, molestie et libero vel, luctus gravida nibh. Proin posuere malesuada nisl vitae pharetra. Donec at condimentum urna. Etiam nec massa massa. Pellentesque libero nunc, ultricies ac scelerisque ac, eleifend non quam."},
                {id: 2, name : "Bob", email : "bob@example.com", body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget massa metus. Sed cursus mauris lectus, at consequat leo eleifend eleifend. Duis justo quam, auctor euismod nibh quis, pretium tempor augue. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse sodales id mi ac semper. Ut risus felis, molestie et libero vel, luctus gravida nibh. Proin posuere malesuada nisl vitae pharetra. Donec at condimentum urna. Etiam nec massa massa. Pellentesque libero nunc, ultricies ac scelerisque ac, eleifend non quam."},
            ];

            this.sendData();
            sb.listen({
                "open-email" : this.markRead.bind(this),
                "generate-email" : this.addNewEmail.bind(this)
            });
        },
        destroy : function() {
        },
        addNewEmail : function(email) {
            email.unread = true;
            email.id = guidGenerator();
            emails.unshift(email);
            this.sendData();
        },
        markRead : function(email) {
            delete emails[email.id].unread;
            this.sendData();
        },
        sendData : function() {
            sb.notify({
                type : "db-emails",
                data : emails
            });
        }
    }
});

CORE.start_all();

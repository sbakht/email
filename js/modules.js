CORE.create_module("emails-catalog", function (sb) {
    var emails;

    return {
        init : function() {
            emails = [{name:"bob", email: "bob@example.com", body: "Kappa"}];

            sb.template(emails);

            sb.listen({
                "generate-email" : this.addNewEmail
            });
        },
        destroy : function () {
            sb.ignore(["generate-email"]);
            emails = null;
        },
        addNewEmail : function(email) {
            emails.unshift(email);
            sb.template(emails);
        }
    }
});

CORE.start_all();

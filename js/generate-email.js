CORE.create_module("random-email", function(sb) {

    return {
        init : function () {
            setInterval(this.createEmail.bind(this), 2000);
            // this.createEmail();
        },
        destroy : function () {
        },
        createEmail : function() {
            Promise.all([this.getRandomName(), this.getRandomBody()]).then(function(data) {
                console.log(data);
                var email = {
                    name : data[0].name,
                    email: "bob@fakemail.com",
                    body : data[1]
                };
                sb.notify({
                    type : "generate-email",
                    data : email
                });
            });
        },
        getRandomName : function() {
           return sb.get("http://uinames.com/api/");
        },
        getRandomBody : function() {
           return sb.get("http://cors.io/?http://loripsum.net/api");
        }
    };
});

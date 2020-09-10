

$(document).ready(function() {
    console.log("reading jquery");
    var max_fields = 6;
    var wrapper = $(".inside-form");
    var add_button = $(".add_form_field");

    var x = 0;
    $(add_button).click(function(e) {
        console.log('clicked');
        e.preventDefault();
        if (x < max_fields) {
            x++;
            $(wrapper).append("<div class=\"portfolio\">"+
                    "<div class=\"form-group\">"+
                        "<input class=\"form-control\" type=\"text\" name=\"cryptocurrency["+x+"][name]"+"\"placeholder=\"cryptocurrency\">"+
                    "</div>"+
                    "<div class=\"form-group\">"+
                        "<input class=\"form-control\" type=\"text\" name=\"cryptocurrency["+x+"][amount]"+"\"placeholder=\"amount\">"+
                    "</div>"+
                    "<button type=\"button\" class=\"delete\ btn\">Remove</button>"+
                "</div>"); 
        } else {
            alert('You Reached the limit')
        }
    });

    $(wrapper).on("click", ".delete", function(e) {
        e.preventDefault();
        $(this).parent('div').remove();
        x--;
    })
});
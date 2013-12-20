(function($){
    $.fn.autoGrowInput = function(o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function(){

            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                }),
                check = function() {
                    var old_val = val;
                    if (val === (val = input.val())) {return;}

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);
                    

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                                             || (newWidth > minWidth && newWidth < o.maxWidth);
                    
                    //Hack
                    if (testerWidth == 0 && val != '') {
                      val = old_val;
                      setTimeout(check, 10); //Hack
                      return;
                    }

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }
                };
            
            input.after(testSubject);

            $(this).bind('keyup keydown blur update change', check);
            setTimeout(check, 0);

            $(this).data('_autogrow_check_function', check);
        });

        return this;

    };

})(jQuery);

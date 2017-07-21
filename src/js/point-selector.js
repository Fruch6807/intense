(function ($) {
    var selectorsCount = 0;

    var actions = {
        init: function (options) {
            if ($(this).parent().hasClass('image-point-selector-wrapper')) {
                return;
            }
            
            selectorsCount++;
            $.extend(options, {
                name: 'image-point-selector-' + selectorsCount,
                displayCoords: true,
                src: ''
            });
            
            
        },

        getCoordinates: function (options) {
            $.extend(options, {

            });

        }
    };

    $.fn.ImagePointSelector = function (action, options) {
        var actionFn = actions[action];
        if (actionFn === undefined) {
            throw new Error('Action ' + action + 'is not defined.');
        }

        actionFn.call(this, options);

        return this;
    };
}(jQuery));

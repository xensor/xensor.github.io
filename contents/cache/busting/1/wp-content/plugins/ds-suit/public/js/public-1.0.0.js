(function ($) {
    'use strict';

    $.fn.dss_hover_link_double_tap = function (params) {

        if (!('ontouchstart' in window) &&
            !navigator.msMaxTouchPoints &&
            !navigator.userAgent.toLowerCase().match(/windows phone os 7/i)) return false;

        this.each(function () {
            var curItem = false;

            $(this).on('click', function (e) {
                var item = $(this);
                if (item[0] != curItem[0]) {
                    e.preventDefault();
                    curItem = item;
                }
            });

            $(document).on('click touchstart MSPointerDown', function (e) {
                var resetItem = true,
                    parents = $(e.target).parents();

                if ($(e.target)[0] == curItem[0]) {
                    return;
                }

                for (var i = 0; i < parents.length; i++) {
                    if (parents[i] == curItem[0]) {
                        resetItem = false;
                    }
                }

                if (resetItem)
                    curItem = false;
            });
        });
        return this;
    };

    $(document).ready(function () {
        $(".dss_bucket .dss_bucket_link").dss_hover_link_double_tap();
    });

})(jQuery);

(function( $ ) {
    'use strict';

    // Create the defaults once
    var pluginName = "gdpr",
        defaults = {
            bla: "",
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;

        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var that = this;
            this.window = $(window);
            this.documentHeight = $( document ).height();
            this.windowHeight = this.window.height();

            this.elements = {};
            this.elements.popup = $('.wordpress-gdpr-popup');
            this.elements.popupAgreeLink = $('.wordpress-gdpr-popup-agree');
            this.elements.popupDeclineLink = $('.wordpress-gdpr-popup-decline');
            this.elements.popupCloseLink = $('.wordpress-gdpr-popup-close');

            this.popUp();
            this.popUpAgree();
            this.popUpClose();
            this.popUpDecline();
            this.checkPrivacySettings();
        },
        popUp : function() {

            var that = this;
            var cookiesAllowed = false;

            $.ajax({
                type : 'post',
                url : that.settings.ajaxURL,
                dataType : 'json',
                data : {
                    action : 'check_privacy_setting',
                    setting : 'wordpress_gdpr_cookies_allowed',
                },
                success : function( response ) {                    
                    if((!response.allowed && !response.declined) || that.getParameterByName('gdpr') === "debug") {
                        that.elements.popup.show();
                    } else {
                        that.elements.popup.hide();
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr);
                    console.log(ajaxOptions);
                    console.log(thrownError);
                }
             });
        },
        popUpClose : function() {

            var that = this;
            
            $(that.elements.popupCloseLink).on('click', function(e) {
                that.elements.popup.fadeOut();
            });
        },
        popUpDecline : function() {

            var that = this;
            
            that.elements.popupDeclineLink.on('click', function(e) {
                e.preventDefault();
                $.ajax({
                    type : 'post',
                    url : that.settings.ajaxURL,
                    dataType : 'json',
                    data : {
                        action : 'wordpress_gdpr_decline_cookies'
                    },
                    success : function( response ) {                    
                        that.elements.popup.fadeOut();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        console.log(ajaxOptions);
                        console.log(thrownError);
                    }
                 });
            });
        },
        popUpAgree : function() {

            var that = this;

            that.elements.popupAgreeLink.on('click', function(e) {
                e.preventDefault();
                $.ajax({
                    type : 'post',
                    url : that.settings.ajaxURL,
                    dataType : 'json',
                    data : {
                        action : 'wordpress_gdpr_allow_cookies'
                    },
                    success : function( response ) {                    
                        that.elements.popup.fadeOut();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        console.log(ajaxOptions);
                        console.log(thrownError);
                    }
                 });
            });
        },
        checkPrivacySettings : function() {

            var that = this;
            var settings = {};

            $.each(that.settings.checks, function(i, index) {
                $.ajax({
                    type : 'post',
                    url : that.settings.ajaxURL,
                    dataType : 'json',
                    data : {
                        action : 'check_privacy_setting',
                        setting : index
                    },
                    success : function( response ) {

                        var checkbox_exists = $('input[name="' + index + '"]') ;

                        if(checkbox_exists.length > 0) {
                            if(response.allowed) {
                                checkbox_exists.prop('checked', true);
                            } else {
                                checkbox_exists.prop('checked', false);
                            }
                        }
                        if(response.html !== "") {
                            $("head").append(response.html);
                        }

                        if(checkbox_exists.length > 0) {
                            checkbox_exists.on('change', function(e) {
                                var checked = $(this).prop('checked');
                                var name = $(this).prop('name');
                                $.ajax({
                                    type : 'post',
                                    url : that.settings.ajaxURL,
                                    dataType : 'json',
                                    data : {
                                        action : 'update_privacy_setting',
                                        setting : name,
                                        checked : checked,
                                    },
                                    success : function( response ) {
                                        console.log(response);
                                    }
                                });
                            });
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        console.log(ajaxOptions);
                        console.log(thrownError);
                    }
                 });
            });
        },
        //////////////////////
        ///Helper Functions///
        //////////////////////
        deleteAllCookies : function() {
            var cookies = document.cookie.split(";");
            console.log(cookies);
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }

        },
        isEmpty: function(obj) {

            if (obj == null)        return true;
            if (obj.length > 0)     return false;
            if (obj.length === 0)   return true;

            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        },
        sprintf: function parse(str) {
            var args = [].slice.call(arguments, 1),
                i = 0;

            return str.replace(/%s/g, function() {
                return args[i++];

            });
        },
        getCookie: function(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
            }
            return "";
        },
        createCookie: function(name, value, days) {
            var expires = "";

            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
            }

            document.cookie = name + "=" + value+expires + "; path=/";
        },
        deleteCookie: function(name) {
            this.createCookie(name, '', -10);
        },
        getParameterByName: function(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
    } );

    // Constructor wrapper
    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };

    $(document).ready(function() {

        $( "body" ).gdpr( 
            gdpr_options
        );

    } );

})( jQuery );
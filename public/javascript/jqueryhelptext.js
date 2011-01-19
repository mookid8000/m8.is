/*
 * jQuery Helptext plugin 1.0
 *
 * http://www.konstellation.dk/blog/2009/04/inline-helptext-med-jquery/
 *
 * Copyright (c) 2009 Seph Soliman
 *
 * Plugin released under BSD License:
 *   http://creativecommons.org/licenses/BSD/
 */
 
jQuery.fn.helptexts = function(textmap) {
	function enterHelpField() {
		var field = this;
		if($(field).hasClass("fieldHelp")) {
			$(field).removeClass("fieldHelp");
			field.value = '';
			field.maxlength = field.oldmaxlength; // * re-set the old limit
			//$(field).unbind("blur");
		}
	}
	function exitHelpField() {
		var field = this;
		if(field.value == '' || field.value == field.helptext) {
			$(field).addClass("fieldHelp");
			field.maxlength = field.oldmaxlength; // * no limit for help text
			field.value = field.helptext;
		}
	}
	
	function removeHelpTexts(form){
		$(form).find("input[helptext]").each(function() {
			if(this.value == this.helptext)
				this.value = '';
		});
	}
	
	this.each(function(){
		jQuery(this).submit(function() { removeHelpTexts(this) });
		
		for(var name in textmap) {
			var helptext = textmap[name];
			jQuery(this).find("input[name="+name+"], textarea[name="+name+"]").each(function() {
				this.helptext = helptext;
				this.oldmaxlength = jQuery(this).attr("maxlength");
				jQuery(this).focus(enterHelpField);
				jQuery(this).blur(exitHelpField);
				jQuery(this).blur();
			});
		}
	});
};


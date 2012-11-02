/*! Easy Validation (c) Aaron Gustafson (@AaronGustafson). MIT License. http://github.com/easy-designs/jquery.easy-validation.js */

/* Easy Validation API
 * 
 * Our validation strategy involves using an HTML5-aware browser’s built-in 
 * validation mechanism, falling back to a JavaScript-based validation scheme
 * in non HTML5-aware browsers, and finally degrading to server-side validation 
 * in non-JavaScript scenarios. HTML5 supports field validation using a few 
 * mechanisms, two of which we commonly use:
 * 
 *  - The required attribute indicates a field is required
 *  - The pattern attribute allows you to indicate a regular expression for matching 
 *    against the supplied content
 * 
 * Using a few custom data-* attributes, you can tailor the error messages 
 * provided to users via browser or JavaScript based validation for forms as a 
 * whole or individual fields:
 * 
 *  - The data-validation-error-empty attribute
 *    When used on a form, it prescribes a global default message for all fields 
 *    that are invalid when empty; when used on a field, it provides a field-specific
 *    error message when empty.
 *  - The data-validaiton-error-invalid attribute
 *    When used on a form, it prescribes a global default message for all fields that 
 *    are invalid; when used on a field, it provides a field-specific error message when invalid.
 * 
 **/

(function( $, document, UA ){
	
	var FALSE = false,
		TRUE = true,
		$forms = $('form'),
		ERROR = 'validation-error',
		EMPTY = ERROR + '-empty',
		INVALID = ERROR + '-invalid',
		DEFAULT_EMPTY_MSG = 'This field cannot be left blank',
		DEFAULT_INVALID_MSG = 'This field is not properly formatted',
		container = 'form > ol > li, .form-item',
		
		// borrowed from Modernizr
		html5_validation = (function( props ){
			var supported = {},
				input	= document.createElement('input');

			$.each( props, function( i, prop ){
				if ( ! ( 'hasOwnProperty'  in input && input.hasOwnProperty( prop ) ) )
				{
					return FALSE;
				}
				else
				{
					supported[prop] = TRUE;
				}
			});
			
			// Android & Safari (inc iOS) have a tendency to lie
			// for now this is the best we can do
			if ( supported.pattern && supported.required &&
				 ( UA.indexOf('android') != -1 || ( UA.indexOf('applewebkit') != -1 && UA.indexOf('chrome') == -1 ) ) )
			{
				return FALSE;
			}
			
			return TRUE;
			
		})('max min pattern required step'.split(' '));
	
	// Validation algorithm
	$.fn.validate = function(){
		
		// Patterns on loan from h5 Validate (https://github.com/dilvie/h5Validate)
		// not using them yet though
		var patterns = {
				tel: /([\+][0-9]{1,3}([ \.\-])?)?([\(]{1}[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?[0-9]{1,4}?)/,
				email: /((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?/,
				url: /(https?|ftp):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?/,
				number: /-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?/,
				dateISO: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
				alpha: /[a-zA-Z]+/,
				alphaNumeric: /\w+/,
				integer: /-?\d+/
			};
			
		$(this).on( 'submit', function( evt ){

			var $form	= $(this),
				$error	= $('<strong class="error-message"/>'),
				empty	= $form.data(EMPTY) || DEFAULT_EMPTY_MSG,
				invalid = $form.data(INVALID) || DEFAULT_INVALID_MSG,
				error	= FALSE; // optimism

			$form
				// cleanup
				.find( '.' + ERROR )
					.children('strong.error-message')
						.remove()
						.end()
					.removeClass( ERROR )
					.end()
				// validation
				.find('input,select,textarea')
					.each(function(){
						var $field = $(this),
							$container = $field.closest( container ),
							val	= $field.val(),
							r, e; 

						if ( $field.is('[required]') && val == '' )
						{
							e = $field.data( EMPTY ) || empty;
							$error
								.clone()
								.text(e)
								.appendTo(
									$container.addClass( ERROR )
								 );
							error = TRUE;
						}
						// not required or not empty
						else
						{
							if ( $field.is('[pattern]') )
							{
								r = new RegExp( $field.attr('pattern') );
								e = $field.data(INVALID) || invalid;
								if ( ! val.match( r ) )
								{
									$error
										.clone()
										.text(e)
										.appendTo(
											$container.addClass( ERROR )
										 );
									error = TRUE;
								}
							}
						}
					 });
			return ! error;
		});		

		return this;
	};
		
	if ( $forms.length )
	{
		if ( html5_validation )
		{
			// custom error messaging
			$( 'input,select,textarea' )
				// handle invalidity
				.on( 'invalid', function(){

					var $field = $(this),
						$form = $field.closest('form'),
						empty	= $form.data(EMPTY) || DEFAULT_EMPTY_MSG,
						invalid = $form.data(INVALID) || DEFAULT_INVALID_MSG,
						msg = '';
					
					if ( this.validity.valueMissing )
					{
						msg = $field.data( EMPTY ) || empty;
					}
					else if ( ! this.validity.valid )
					{
						msg = $field.data( INVALID ) || invalid;
					}
					
					$field.closest( container )
						.addClass( ERROR );
						
					this.setCustomValidity( msg );
					
				 })
				// reset
				.on( 'change', function(){
					
					$(this).closest( container )
						.removeClass( ERROR );
					
					this.setCustomValidity('');
					
				 });
		}
		else
		{
			//console.log('no html5 :-(');
			$forms.validate();
		}
	}
	
	
})( jQuery, document, navigator.userAgent.toLowerCase() );
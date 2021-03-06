(function($) {
	$(function() {
		$.validator.addMethod('trueEmail', function(data) {
			var exp = /^[\w.\+-]+@+[\w-]+\.+([\w]){2,6}$/;
			return exp.test(data);
		});

		$('form#email-val').validate({
			rules: {
				email: {
					required: true,
					trueEmail: true
				}
			},
			messages: {
				email: {
					required: 'Needs to be filled',
					trueEmail: 'Wrong email format'
				}
			},
			submitHandler: function(form) {
				return false;
			}
		});

		$('body').on('click', '.edit-list', function() {
			var $target = $(this).parents('.column-title').siblings('.column-body');

			if ($(this).html() != 'OK') {
				$(this).html('OK');
				$target.addClass('edit');
			} else {
				$(this).html('E');
				$target.removeClass('edit');
			}
		});

		$('body').on('click', '.delete-item', function() {
			$.ajax({
				method: 'POST',
				url: '/delete',
				data: {
					id: $(this).data('id')
				}
			});
		});

		$('form.publish').on('focus', 'input[type=text]', function() {
			$(this).parents('form').addClass('active');
		});

		$('form.publish').on('blur', 'input[type=text]', function() {
			$(this).parents('form').removeClass('active');
		});

		var obj = Backbone.Model.extend({
			defaults: {
				'background-color': 'blue',
				'width': '200px',
				'height': '30px',
				'top': '19px',
				'left': '0px',
				'el': 'undefined'
			},

			initialize: function(params) {
				this.el = $('<div></div>');
				_.extend(this.defaults, params);
				this.el.css(this.defaults);
				$('#canvas').append($(this.el));

				var thiz = this;
				this.el.on('mousemove', function() {
					var left = Number(thiz.el.css('left').replace('px', ''));
					this.left = left + 5 + 'px';
					thiz.el.css('left', left + 5 + 'px');
				})
			}
		});

		var col = Backbone.Collection.extend({model: obj});

		var squares = new col();
		var square = new obj;
		squares.add(square);

		subscribe();
		function subscribe() {
			var xhr = new XMLHttpRequest();

			xhr.open('GET', '/subscribe', true);
			xhr.onload = function() {
				$('#notes').replaceWith($(this.responseText).filter('#notes'));
				subscribe();
			}

			xhr.send('');
		}
	});
}).call(this, jQuery);

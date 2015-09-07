(function($) {
	$(function() {
		$.validator.addMethod('trueEmail', function(data) {
			var exp = /^[\w.\+-]+@+[\w-]+\.+([\w]){2,6}$/;
			return exp.test(data);
		});

		$('form').validate({
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
			submitHandler: function() {
				return false;
			}
		});

		var obj = Backbone.Model.extend({
			defaults: {
				'background-color': 'blue',
				'width': '200px',
				'height': '30px',
				'top': '130px',
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
		var square2 = new obj({
			'top': '20px',
			'height': '45px',
			'background-color': 'red',
			'width': '110px'
		});
		squares.add(square2);
	});
}).call(this, jQuery);

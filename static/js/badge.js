var badge_conf = {
  'category': {

    'br': {
			'source': {
					'name': 'oc_ramose',
					'call': 'http://opencitations.net/index/coci/api/v1/metadata/[[VAR]]',
					'format': 'json',
					//can preview on_badge any value inside the fields, is chosen from the html tag attribute 'preview'
		      'fields': ['citation_count','year'],
		      "respects": [],
			},

      //when highlighting the badge
      'onhighlighting': null,
      //when clicking on the badge
      'onclick_link': 'http://opencitations.net/index/coci/browser/[[VAR]]'
    }
  }
}

var ocbadge_container = document.getElementsByTagName("ocbadge");
var ocbadge_list = [];
var badge_calls = {};



var badge = (function () {

	function init_badge_index(ocbadge_container) {
		//init badge dict
		for (var i = 0; i < ocbadge_container.length; i++) {
			var ocbadge_obj = ocbadge_container[i];
			ocbadge_list.push({
					'input': ocbadge_obj.getAttribute('input'),
					'preview': ocbadge_obj.getAttribute('preview'),
					'type': ocbadge_obj.getAttribute('type'),
					'dom_built': false
			})
		}
	}

	function get_preview_data(ocbadge_list, badge_conf_cat) {
		for (var i = 0; i < ocbadge_list.length; i++) {
			var ocbadge_obj = ocbadge_list[i];
			var badge_cat = badge_conf_cat[ocbadge_obj['type']];
			var text_query = badge_util.build_text_query({},badge_cat.source.call,ocbadge_obj.input);

			badge_calls[text_query] = {
				'data': null,
				'type': ocbadge_obj['type'],
				'input': ocbadge_obj['input'],
				'preview': ocbadge_obj['preview'],
				'name': badge_cat.source.name,
				'format': badge_cat.source.format,
				'respects': badge_cat.source.respects,
				'fields': badge_cat.source.fields,
				'onhighlighting': badge_cat.onhighlighting,
	      'onclick_link': badge_cat.onclick_link
			};

			//execute the calls
			call_service(text_query);

		}
	}

	function call_service(call_url, def_callbk = badge_callbk) {

	  var result = {};
		$.ajax({
					url: call_url,
					type: 'GET',
					async: false,
					success: function( res ) {
						result['call_url'] = call_url;
						result['data'] = res;
						Reflect.apply(def_callbk,undefined,[result]);
					}
		 });
	}

	function badge_callbk(result_obj){
		var call_obj = null;
		if (result_obj.call_url in badge_calls) {
			call_obj = badge_calls[result_obj.call_url];
		}

		if (call_obj == null) {
			return -1;
		}

		//insert the data retrieved
		badge_calls[result_obj.call_url].data = badge_util.get_values_with_rist(
																result_obj.data,
																call_obj.fields,
																call_obj.respects);

		console.log(badge_calls[result_obj.call_url]);
		//build the html dom now
		badge_htmldom.build_badge(badge_calls[result_obj.call_url]);
	}

	return {
		//test_func: test_func
		init_badge_index: init_badge_index,
		get_preview_data: get_preview_data
	}
})();


var badge_util = (function () {

	function build_text_query(one_result, query_text, def = null) {
			var myRegexp = /\[\[(.*)\]\]/g;
			var match = myRegexp.exec(query_text);

			//get all values
			var index = [];
			for (var i = 1; i <= match.length; i++) {
				if (def != null) {
					index.push(
						{
							'name': match[i],
							'value': def
						}
					)
				}
				else if (one_result[match[i]] != undefined) {
					index.push(
						{
							'name': match[i],
							'value': one_result[match[i]].value
						}
					)
				}
			}

			//rebuild the query
			var matched_query = query_text;
			for (var i = 0; i < index.length; i++) {
				matched_query = matched_query.replace("[["+index[i].name+"]]", index[i].value);
			}

			return matched_query;
		}
	function get_values_with_rist(dataarr_obj, fields, respects, innervalue = false) {

			var ret_vals = {};
			var respects_index = {};

			//init both dict
			for (var i = 0; i < fields.length; i++) {
				ret_vals[fields[i]] = [];
			}
			for (var i = 0; i < respects.length; i++) {
				if (respects[i].param in respects_index) {
					respects_index[respects[i].param].push(respects[i].func);
				}else {
					respects_index[respects[i].param] = [respects[i].func];
				}
			}

			// check if all fields respect restrictions
			for (var i = 0; i < dataarr_obj.length; i++) {
				var dataobj = dataarr_obj[i];
				var addit = true;
				for (var key_field in dataobj) {
						if (key_field in respects_index) {
							for (var j = 0; j < respects_index[key_field].length; j++) {
								var func_i = respects_index[key_field][j];
								if (innervalue) {
									addit = addit && Reflect.apply(func_i,undefined,[dataobj[key_field].value]);
								}else {
									addit = addit && Reflect.apply(func_i,undefined,[dataobj[key_field]]);
								}
							}
						}
				}

				//add all row
				if (addit) {
					for (var key_field in dataobj) {
						if (key_field in ret_vals) {
							if (innervalue) {
								ret_vals[key_field].push(dataobj[key_field].value);
							}else {
								ret_vals[key_field].push(dataobj[key_field]);
							}
						}
					}
				}
			}

			return ret_vals;
	}
	return {
		//test_func: test_func
		build_text_query: build_text_query,
		get_values_with_rist: get_values_with_rist
	}
})();
var badge_htmldom = (function () {

	function build_badge(obj_call) {
		for (var i = 0; i < ocbadge_container.length; i++) {
			var ocbadge_obj = ocbadge_container[i];
			console.log(ocbadge_obj);
			console.log(obj_call);
			if( (ocbadge_obj.type == obj_call.type) && (ocbadge_obj.input == obj_call.input) && (ocbadge_obj.preview == obj_call.preview)
			){
				var lbl = document.createElement("label");
				div_val.innerHTML = obj_call.data[obj_call.preview];

				//
				ocbadge_obj.appendChild(lbl);
				console.log(ocbadge_obj);
			}

		}
	}

	return {
		//test_func: test_func
		build_badge: build_badge
	}
})();



//The main code

//init badge dict
badge.init_badge_index(ocbadge_container);

console.log(ocbadge_list);

badge.get_preview_data(ocbadge_list, badge_conf.category);

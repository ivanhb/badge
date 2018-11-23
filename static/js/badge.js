var badge_conf = {
  'category': {

    'br': {
			'source': {
					'source': 'oc_ramose',
					'call': 'http://opencitations.net/index/coci/api/v1/metadata/[[VAR]]',
					//can preview on_badge any value inside the fields, is chosen from the html tag attribute 'preview'
		      'fields': null,
		      "respects": null,
			},

      //when highlighting the badge
      'onhighlighting': null,
      //when clicking on the badge
      'onclick_link': null
    }
  }
}



var badge = (function () {

	function init_badge_index(ocbadge_container) {
		//init badge dict
		var ocbadge_list = [];
		for (var i = 0; i < ocbadge_container.length; i++) {
			var ocbadge_obj = ocbadge_container[i];
			ocbadge_list.push({
					'input': ocbadge_obj.getAttribute('input'),
					'preview': ocbadge_obj.getAttribute('preview'),
					'type': ocbadge_obj.getAttribute('type'),
			})
		}
		return ocbadge_list;
	}

	function get_preview_data(ocbadge_list, badge_conf_cat) {
		for (var i = 0; i < ocbadge_list.length; i++) {
			var ocbadge_obj = ocbadge_list[i];
			var badge_cat = badge_conf_cat[ocbadge_obj['type']];
			var text_query = badge_util.build_text_query({},badge_cat.call,ocbadge_obj.input);

		}
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
	return {
		//test_func: test_func
		build_text_query: build_text_query
	}
})();


var badge_htmldom = (function () {
	return {
		//test_func: test_func
	}
})();



//The main code
var ocbadge_container = document.getElementsByTagName("ocbadge");

//init badge dict
var ocbadge_list = badge.init_badge_index(ocbadge_container);
console.log(ocbadge_list);

badge.get_preview_data(ocbadge_list, badge_conf.category);

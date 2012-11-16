/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - http://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document, undefined) {
  // Get and display similar nodes with AJAX.
  ourjson = null;
  node_name = 'node';
  node_name_print = 'node';
  // Get ourjson from /[nodes]-like-this?title=New+node
  //example result: '      {"nodes":[{"node":{"title":"A new node hope","tags":"trilogies"}}]}    ';
  function get_json() {
    var title = document.getElementById('edit-title');
    if(title == null) return;
    if(title.value.trim().length <= 3) {
      entries_display_area().innerHTML = '';
      ourjson = null;
      return;
    }
    display_entries_spinner();
    $.ajax({
      // You may wish to set up a template that won't display the usual sections around your page body.  This is not strictly necessary, but can reduce server load.
      url: '/'+node_name+'-nodes-like-this?title='+escape(title.value.trim()), //+"&template=sparse",
      cache: false
    }).done(function( html ) {
      var startidx = html.indexOf('<div class="view-content">')+'<div class="view-content">'.length;
      html = html.substring(startidx, html.indexOf('</div>', startidx));
      // De-entitize the HTML.
      html = $("<div/>").html(html).text();
      ourjson = JSON.parse(html);
      grep_from_json();
    });
  }

  // Select and display only the nodes that match all current selections.
  function grep_from_json() {
    var criteria = { 'Title':1 };
    if(ourjson == null) {
      display_entries(new Array(), criteria);
      return;
    }
    var entries_to_display = new Array();
    // For each node
    for (var node in ourjson.nodes) {
      node = ourjson.nodes[node].node;
      var display_entry = true;
      // For each entry
      for(var entry in node) {
        var entry_id = entry.toLowerCase().replace(/ /g,'-');
        //alert("Entry "+entry_id+" is "+node[entry]);

        var entry_no = 0;
        var values = new Array();
        while(entry_no == 0) {
          // If a similarly-named input exists: id="edit-field-node-"+entry_id+"-und-"+entry_no+"-value"
          while(document.getElementById("edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-value") != null) {
            // Collect them all, separated by commas.
            values.push(document.getElementById("edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-value").value.trim());
            $("#edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-value").unbind('change', grep_from_json);
            $("#edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-value").bind('change', grep_from_json);
            entry_no++;
          }
          // If a similarly-named input with nodeid: id="edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-nid"
          while(document.getElementById("edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-nid") != null) {
            // Collect them all, separated by commas, removing the " [nid: .*" bit from the values.
            var this_value = document.getElementById("edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-nid").value;
            this_value = this_value.substring(0,this_value.indexOf(' [nid:'));
            values.push(this_value.trim());
            $("#edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-nid").unbind('change', grep_from_json);
            $("#edit-field-"+node_name+"-"+entry_id+"-und-"+entry_no+"-nid").bind('change', grep_from_json);
            entry_no++;
          }
          // Elsif a similarly-named select object exists: id="edit-field-"+node_name+"-"+entry_id+"-und"
          if(entry_no == 0 && document.getElementById("edit-field-"+node_name+"-"+entry_id+"-und") != null) {
            $("#edit-field-"+node_name+"-"+entry_id+"-und").unbind('change', grep_from_json);
            $("#edit-field-"+node_name+"-"+entry_id+"-und").bind('change', grep_from_json);
            // Collect all selected values, separated by commas.
            var this_select = document.getElementById("edit-field-"+node_name+"-"+entry_id+"-und");
            var i=0;
            if(this_select[i].text.substring(0,2) == '- ') i=1;
            for(; i < this_select.length; i++) {
              if(this_select[i].selected) {
                values.push(this_select[i].text.trim());
              }
            }
          }
          if(entry_no == 0 && entry_id.indexOf('-') > 0) {
            // Go back and look for the name mashedtogether.
            entry_id = entry_id.replace(/-/g, '');
          } else {
            break;
          }
        }
        // Compare the input values to the node expectation, or empty.
        while(values.length > 0 && values[values.length-1] == '') {
          values.pop();
        }
        if(values.length != 0) {
          for(var value in values) {
            if(values[value].trim() == '') continue;
            if(node[entry].indexOf(values[value].trim()) < 0) {
              display_entry = false;
              criteria[entry] = 1; // Indicating that this entry eliminated some nodes.
              //alert(node['title']+" excluded by "+node[entry]+' != '+values.join(', '));
              break;
            }
          }
          if(display_entry == false) break;
        }
      }
      if(display_entry) {
        entries_to_display.push('<a target="_blank" href="'+node['Path']+'">' + node['title'] + '</a>');
      }
    }
    display_entries(entries_to_display, criteria);
  }

  // Returns the entries display area div, creating it if necessary.
  function entries_display_area() {
    var div = document.getElementById('entries_display_area');
    if(div == null) {
      div = document.createElement('div');
      div.id = 'entries_display_area';
      var pdiv = document.getElementById('edit-title');
      if(pdiv == null) {
        // In case of element not found, just add this at the bottom of everything.
        pdiv = document.body;
      } else {
        pdiv = pdiv.parentNode;
      }
      pdiv.appendChild(div);
    }
    return div;
  }

  // entry_list: An array of zero or more strings containing displayable HTML.
  // criteria: a hash where the keys are the criteria used to eliminate irrelevant nodes.
  // Displays a count of those strings, and a list of those strings, along with which criteria were used.
  function display_entries(entry_list, criteria) {
    var carr = new Array();
    // carr = Object.keys(criteria), except that IE8 doesn't support this.
    for(var c in criteria) {
      carr.push(c);
    }
    criteria = "for this " + carr.join(' and ') + '.';
    if(entry_list.length == 0) {
      entries_display_area().innerHTML = '<h3>No similar '+node_name_print+' nodes found</h3>'+criteria;
    } else {
      var l = entry_list.length;
      var entries_data = '<h3>'+l+' similar '+node_name_print+' node';
      if(l != 1) entries_data += 's';
      entries_data += ' found</h3>'+criteria+'<ul><li>';
      entries_data += entry_list.slice(0,5).join('</li><li>');
      entries_data += '</li></ul>';
      entries_display_area().innerHTML = entries_data;
    }
  }

  // Makes the entries display area show the usual sort of AJAX spinner.
  function display_entries_spinner() {
    entries_display_area().innerHTML = '<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div><div class="message">Searching for similar '+node_name_print+' nodes...</div></div><div class="clearfix">&nbsp;</div>';
  }
  $(document).ready(function() {
    node_name = document.URL.substr(document.URL.lastIndexOf('/')+1);
    // TODO: Get this from the title instead?
    node_name_print = node_name.replace(/[_-]/g, ' ');
    if(node_name_print.indexOf('?') > 0) {
      node_name_print = node_name_print.substr(0,node_name_print.indexOf('?'));
    }
    $('#edit-title').change(get_json);
    $(document).ajaxComplete(grep_from_json);
    get_json();
  });
})(jQuery, Drupal, this, this.document);

var all_reqs = [];
var catagories = [];
var fonts = [];
var start = new Date();

function get_reqs(el) {
  var reqs = $(el).attr("data-reqs");
  if (!reqs) return [];
  reqs = reqs.replace(/(\r\n|\n|\r)/gm," ");
  reqs = reqs.split(" ").map($.trim);
  while (reqs.indexOf('') != -1) {
    reqs.splice(all_reqs.indexOf(''), 1);
  }
  return reqs;
}

function matches(el, on) {
  if (on.length == 0) return true;

  var reqs = get_reqs(el);

  for (var i in on) {
    //console.log("checking "+on[i]);
    if ($.inArray(on[i], reqs) == -1) {
      //console.log("does not have "+on[i]);
      return false;
    }
  }

  return true;
}

function is_on(req) {
  return $("#"+req).hasClass("active");
}

function get_on() {
  var on = [];
  for (var i in all_reqs) {
    //console.log("checking "+all_reqs[i]);
    var checked = is_on(all_reqs[i]);
    if (checked) {
      on.push(all_reqs[i]);
    }
  }
  return on;
}

function calc_min_price(reqs) {
  var min_price = "999999";
  $(".opt").each(function() {
    if (matches(this, reqs)) {
      var price = parseInt($(this).attr("data-price"));
      if (price < min_price) {
        min_price = price;
      }
    }
  });
  if (min_price == "999999") return "N/A"
  return min_price;
}

function calc_num(reqs) {
  var num = 0;
  $(".opt").each(function() {
    if (matches(this, reqs)) {
      num +=1;
    }
  });
  return num;
}

function update_costs() {
  var on = get_on();
  var base_cost = calc_min_price(on);
  for (var i in all_reqs) {
    var req = all_reqs[i];
    var on = get_on();
    if (is_on(req)) {
      on.splice(on.indexOf(req), 1);
    } else {
      on.push(req);
    }
    var min_price = calc_min_price(on);
    var num = calc_num(on);
    //console.log(on+" "+min_price);
    if (""+(min_price-base_cost)== "NaN") {
      $('#'+req).html($("#"+req).attr('id')+" $X");
    } else {
      $('#'+req).html($("#"+req).attr('id')+" ("+num+") $"+(min_price-base_cost));
    }
  }
}

function filter_change() {
  $(this).toggleClass("active");

  var on = get_on();
  console.log("Currnetly Checked: "+on.join(" "));

  $(".opt").each(function() {
    if (matches(this, on)) {
      $(this).removeClass("hidden");
    } else {
      $(this).addClass("hidden");
    }
  });
  update_costs();
}

function expand_requirements(font) {
  font.reqs = font.reqs.split(" ");
}

function parse_yaml(yaml) {
  console.log("Loaded text in "+(new Date() - start));
  start = new Date();

  var obj = jsyaml.load(yaml);
  categories = obj.categories;
  for (var i=0; i<categories.length; i++) {
    expand_requirements(categories[i]);
  }
  fonts = obj.fonts;
  for (var i=0; i<fonts.length; i++) {
    //console.log(serialize(fonts[i]));
    expand_requirements(fonts[i]);
  }

  console.log("Parsed yaml in "+(new Date() - start));
  start = new Date();
}

function serialize(fonts) {
  var s = JSON.stringify(fonts, null, '  ')
  //console.log(JSON.stringify(fonts, null, '  '));
  var yaml = jsyaml.dump(fonts, {
    flowLevel: 3,
    styles: {
      '!!int'  : 'hexadecimal',
      '!!null' : 'camelcase'
    }
  });
  return s;
}

function to_set(arr) {
  //removes duplicates
  arr = arr.filter(function(elem, pos) {
      // return true (match/keep) if the first index of the element is equal to the current position
      return arr.indexOf(elem) == pos;
  });
  return arr;
}
function remove_null(arr) {
  if (arr.indexOf('') != -1) {
    arr.splice(arr.indexOf(''), 1);
  }
  return arr;
}

function to_html(font) {
  var fam = font.name;
  var google = font.name;
  if (font.google) {
    google = font.google;
  }
  if (font.fontFamily) {
    fam = font.fontFamily;
  }
  var price = 0;
  if (font.price) price = font.price;

  var opt = "<div style='font-family:"+fam+", Ubuntu Mono' class='opt' data-name='"+font.name+"' data-reqs='"+font.reqs.join(" ")+"' data-price='0'>\n";
  opt += "<a name='"+font.name+"'></a>\n";
  opt += "<div class='google_disp'><a href='http://www.google.com/webfonts/specimen/"+font.name+"'>google</a></div>";
  opt += "<div class='search'><a href='http://google.com/search?q="+font.name+"+font'>search</a> -&nbsp;</div>"
  var extra = "";
  if (font.reqs.indexOf('nr') == -1) extra = " - &frac14; &#8723; &#8470;1"
  opt += "<h1>"+font.name+"/<span style='font-weight:900'>W900<span> $"+price+extra+"</h1>\n";

  if (font.reqs.indexOf('nr') == -1) {
    opt += "<div class='s1'>Lorem ipsum dolor sit amet, <em>consectetur adipisicing elit</em>, <strong>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</strong>. Ut enim ad minim veniam, <span style='font-weight:300'>quis nostrud exercitation</span> ullamco <span style='font-weight:500'>laboris nisi ut aliquip ex ea commodo consequat</span>.</div>"
    opt += "<div class='s2'>Lorem ipsum dolor sit amet, <em>consectetur adipisicing elit</em>, <strong>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</strong>. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>"
  } else {
    opt += "Sample Image:<br>\n"
    opt += "<div class='retina'><img src='samples/"+font.name+".png'></div>"
  }

  if (font.reqs.indexOf('google') != -1) {
    opt += "<link href='http://fonts.googleapis.com/css?family="+google.replace(" ", "+")+":300,400,500,400italic,500,700,900' rel='stylesheet' type='text/css'>\n"
  }
  if (font.info) {
    opt += font.info+"\n";
  }
  opt += "</div>";
  if (font.name == "Roboto")
      console.log(opt)
  return opt;
}

$(document).ready(function () {
  var start = new Date();
  $.ajax({
    url: "fonts.yaml",
  }).done(function(yaml) {
    parse_yaml(yaml);

    for (var i=0; i<categories.length; i++) {
      var cat = categories[i];
      all_reqs = all_reqs.concat(cat.reqs);
    }

    all_reqs = to_set(all_reqs);
    all_reqs = all_reqs.sort();
    all_reqs = remove_null(all_reqs);
    console.log('All Requirements ' + all_reqs);

    var opt_html = "";
    for (var i=0; i<fonts.length; i++) {
      var font = fonts[i];
      opt_html += to_html(font);
    }
    $("#opts").html(opt_html);

    var filter_html = "";
    for (var i=0; i<categories.length; i++) {
      var cat = categories[i];
      for (var j=0; j<cat.reqs.length; j++) {
        var req = cat.reqs[j];
        filter_html += '<button id="'+req+'" type="button" class="btn btn-primary btn-small check">'+req+'</button>';
      }
      filter_html += "<br>";
    }
    $("#filter").html($("#filter").html()+filter_html);

    $("button.check").click(filter_change);

    update_costs();
  });
});


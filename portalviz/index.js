function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

var url_param = getURLParameter('url');
var limit_param = getURLParameter('limit');
//defaults
var url = 'data.cityofnewyork.us';
var limit = '1000';

if(url_param) {
    url = url_param;
    if(limit_param) { limit = limit_param; }
}

d3.json("https://api.us.socrata.com/api/catalog/v1?domains="+url+"&search_context="+url+"&limit="+limit, function(error, data) {
    if (error) return console.error(error);
    console.log("Fetched "+limit+" of "+data.resultSetSize);
    var newdata = []
    _.each(data.results,function (d) {
        asset = {}
        // console.log(d);
        asset['count'] = 1;
        if (d.permalink){
             asset['url'] = d.permalink;
         } else{
            console.log("d.permalink");
            console.log(d.permalink);
         }
        if (d.resource.view_count){
            if (d.resource.view_count.page_views_total){
             asset['views'] = d.resource.view_count.page_views_total;
            }
         } else{
            console.log("d.resource.view_count.page_views_total");
            console.log(d.resource.view_count);
         }
        if (d.resource.download_count){
             asset['downloads'] = d.resource.download_count;
         } else{
            // console.log("d.resource.download_count");
            // console.log(d.resource.download_count);
         }
        if (d.resource.name){
            var dirtyString = d.resource.name;
            var cleanString = dirtyString.replace(/[|&~;$`%@"<>()+,]/g, "");
             asset['name'] = cleanString +" ["+d.resource.type+"]" ;
         } else{
            console.log("d.resource.name");
            console.log(d.resource.name);
         }
        if (d.resource.type){
             asset['type'] = d.resource.type;
         } else{
            console.log("d.resource.type");
            console.log(d.resource.type);
         }
        if (d.resource.updatedAt){
             asset['updatedAt'] =d.resource.updatedAt;
         } else{
            console.log("d.resource.updatedAt");
            console.log(d.resource.updatedAt);
         }
        if (d.resource.provenance){
             asset['provenance'] = d.resource.provenance;
         } else{
            console.log("d.resource.provenance");
            console.log(d.resource.provenance);
         }
        if (d.classification.domain_category){
             asset['category'] = d.classification.domain_category;
         } else{
            // console.log("d.classification.domain_category");
            // console.log(d.classification.domain_category);
            asset['category'] = "No Category"
         }
        // asset['socrata_category_1'] = d.classification.categories[0];
        // console.log(asset);
        newdata.push(asset);
    });
      // console.log(newdata);
      console.log(newdata.length);


  function titleget(d) {
    if (typeof d.type === 'string' || d.type instanceof String){
        return d.type;
    }

  };
  function tooltipHTML(d){
    datum = _.find(newdata,function(s){return s.name == d});
    return "<a href="+datum.url+" target='_blank'>Go to Asset</a>"+
           "<br><a href="+datum.url+"/stats"+" target='_blank'>Go to Asset's Stats</a>"

  }
  // instantiate d3plus
  var visualization = d3plus.viz()
    .container("#viz")     // container DIV to hold the visualization
    .data(newdata)     // data to use with the visualization
    .type("bubbles")       // visualization type
    .id(["category", "name"]) // nesting keys
    .depth(1)              // 0-based depth
    .size("views")         // key name to size bubbles
    .color("category")        // color by each group
    .ui([
        {
            "method":"size",
            "value":[{"Total Views":"views"},"downloads",{"None":"count"}]
        },
        {
           "method":"color",
           "value":["category","type"]
        }
        ])
    .legend({"labels":true,
            "filters":true,
            "title": titleget
        })
    .tooltip(
        {"html":tooltipHTML,
         "stacked":true,
         "value":["category","views","downloads","type"]
        })
    .draw()                // finally, draw the visualization!
});
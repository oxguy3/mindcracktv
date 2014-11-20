function getPersonById(query) {
  for (var i = 0; i < people.length; i++) {
    if (people[i].id == query) {
      return people[i];
    }
  }
  var placeholder = {
    id: query,
    displayName: "??? (" + query + ")",
    displayNameShort: "???"
  }
  return placeholder;
}

function getViewByPerson(query, views) {
  for (var i = 0; i < views.length; i++) {
    if (views[i].by == query) {
      return views[i];
    }
  }
  return null;
}

function isPersonInViews(query, views) {
  for (var i = 0; i < views.length; i++) {
    if (views[i].by == query) {
      return true;
    }
  }
  return false;
}

function compareShowViews(a,b) {
  return (a.by).localeCompare(b.by);
}


function generateShowBox(showId) {
  var show = shows[showId];
  var box = $("#showTemplate").children().clone(true,true);

  var latest = show.episodes[show.episodes.length-1];
  var featuredIndex = Math.floor((Math.random() * latest.views.length));

  box.find('[data-field="title-html"]').html(show.title);

  box.find('[data-field="thumbnail-src"]').attr("src", show.thumbnail);

  var latestDateStr = prettyDate(new Date(latest.date));
  box.find('[data-field="datePretty-html"]').html(latestDateStr);

  box.find('[data-field="date-livestamp"]').attr("data-livestamp", latest.date);

  var featuredYoutubeLink = youtubeLink(latest.views[featuredIndex].yt);
  box.find('[data-field="latest_featured_yt-href"]').attr("href", featuredYoutubeLink);

  var featuredByStr = getPersonById(latest.views[featuredIndex].by).displayName;
  box.find('[data-field="latest_featured_by-title"]').attr("title", featuredByStr);

  latest.views.sort(compareShowViews);

  var otherViews = "";
  for (var i = 0; i < latest.views.length; i++) {
    var view = latest.views[i];
    var viewStr = "";
    if (latest.views.length - 3 == i) viewStr += '<span class="nobr">';
    viewStr += '<a href="';
    viewStr += youtubeLink(view.yt);
    viewStr += '" target="_blank" class="view-link-secondary" title="';
    viewStr += getPersonById(view.by).displayName;
    viewStr += '"><span class="view-link-secondary-icon playerpic-32 ';
    viewStr += view.by;
    viewStr += '"></span></a>';
    otherViews += viewStr;
  }
  otherViews += "</span>";
  box.find('[data-field="latest_all-html"]').html(otherViews);

  box.find('.show-box-btn-archives').attr("data-showindex", showId);

  return box;
}


function generateMindcrackToday() {
  var listDiv = $(".mindcrack-today-list");
  var today = mindcrackServerDays[0];

  $(".mindcrack-today-datePretty").html(prettyDate(new Date(today.year, today.month - 1, today.day)));

  shuffle(today.videos);

  var listHtml = "";
  for (var i = 0; i < today.videos.length; i++) {
    var videoHtml = "";
    var video = today.videos[i];
    videoHtml += '<a href="';
    videoHtml += youtubeLink(video.yt);
    videoHtml += '" class="list-group-item mindcrack-today-list-item" data-arrindex="';
    videoHtml += i
    videoHtml += '"><span class="pull-right mindcrack-today-playericon" title="';
    videoHtml += getPersonById(video.by).displayName;
    videoHtml += '"><span class="playerpic-24 ';
    videoHtml += video.by;
    videoHtml += '"></span></span>';
    videoHtml += video.title;
    videoHtml += '</a>';
    listHtml += videoHtml;
  }
  listDiv.html(listHtml);
}


function generateContent() {

  // generate Today on the Mindcrack Server
  generateMindcrackToday();

  var homeContent = $(".home-content");

  // generate shows
  for (var i = 0; i < shows.length; i++) {
    homeContent.append(generateShowBox(i));

    if ((i+1) % 3 == 0) {
      homeContent.append('<div class="clearfix visible-lg-block"></div>');
      homeContent.append('<div class="clearfix visible-md-block"></div>');
    }
    if ((i+1) % 2 == 0) {
      homeContent.append('<div class="clearfix visible-sm-block"></div>');
    }
  }

}

generateContent();



$(".home-content").tooltip({
  placement: 'bottom',
  selector: '.view-link-secondary'/*, .show-box-btn-text'*/,
  trigger: 'hover'
});



$(".mindcrack-today-list").tooltip({
  selector: '.mindcrack-today-playericon',
  trigger: 'hover'
});



// showcase video handling
var showcaseImgPlaceholder = "img/hqdefault-placeholder.jpg";
var showcaseImgPlaceholderXs = "img/mqdefault-placeholder.jpg";
$(".mindcrack-today-showcaseimg").css("background-image", "url("+showcaseImgPlaceholder+")");
$(".mindcrack-today-showcaseimg-xs").attr("src", showcaseImgPlaceholderXs);

var showcaseDescriptionPlaceholder = "Click on a video for more details.";
$(".mindcrack-today-showcase-description").html(showcaseDescriptionPlaceholder);

var mindcrackTodayListItemForceDefault = false;

$(".mindcrack-today-list-item").click(function(event) {
  mindcrackTodayListItemClick(this, event);
});

function mindcrackTodayListItemClick(element, event) {
  if (event.ctrlKey || mindcrackTodayListItemForceDefault) {
    mindcrackTodayListItemForceDefault = false;
    return true;
  }
  event.preventDefault();

  var today = mindcrackServerDays[0];
  var video = today.videos[parseInt($(element).attr("data-arrindex"))];

  var imgsrc = youtubeHqThumbnail(video.yt);
  var imgsrcXs = youtubeMqThumbnail(video.yt);
  $(".mindcrack-today-showcaseimg").css("background-image", "url("+imgsrc+")");
  $(".mindcrack-today-showcaseimg-xs").attr("src", imgsrcXs);

  $(".mindcrack-today-showcase-description").html(getVideoDetails(video));

  $(".mindcrack-today-list-item").removeClass("active");
  $(element).addClass("active");
}

$(".mindcrack-today-list-item").dblclick(function(event) {
  mindcrackTodayListItemForceDefault = true;
  $(this)[0].click();
});

$(".mindcrack-today-list-item")[0].click();


function getVideoDetails(video) {
  var videoMoment = moment(video.date);
  var detailsHtml = "";
  detailsHtml += '<div class="clearfix">';

  detailsHtml += '<div class="mindcrack-today-showcase-playerpic pull-left">';
  detailsHtml += '<span class="playerpic-32 ' + video.by + '"></span>';
  detailsHtml += '</div>';

  detailsHtml += '<div class="pull-left">';
  detailsHtml += '<a class="mindcrack-today-showcase-username" href="';
  detailsHtml += linkYoutubeChannel(video.by) + '">';
  detailsHtml += getPersonById(video.by).displayName + '</a><br>';
  detailsHtml += '<span class="mindcrack-today-showcase-date text-muted" title="';
  detailsHtml += videoMoment.format('LLL') + '">';
  detailsHtml += videoMoment.fromNow();
  detailsHtml += '</span>';
  detailsHtml += '</div>';

  detailsHtml += '<div class="pull-right mindcrack-today-showcase-videolink">';
  detailsHtml += '<a href="' + youtubeLink(video.yt) + '" class="btn btn-primary">';
  detailsHtml += '<span class="glyphicon glyphicon-play"></span> Watch</a>'
  detailsHtml += '</div>';

  detailsHtml += '</div>';
  detailsHtml += '<p>';
  if (video.tagline) {
    detailsHtml += '<span class="label label-primary text-uppercase">';
    detailsHtml += video.tagline + '</span> ';
  }
  detailsHtml += video.description + '</p>';
  return detailsHtml;
}






// archives modal handling

$('.show-archives-modal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var showId = button.data('showindex'); 
  var show = shows[showId];
  var modal = $(this);


  modal.find('.show-archives-heading').text(show.title);
  var table = modal.find('.show-archives-table');
  var tableBody = table.children("tbody");

  tableBody.empty();

  var tableRows = "";

  for (var i = 0; i < show.episodes.length; i++) {
    var episode = show.episodes[i];
    var epMoment = moment(episode.date);

    var tr = '<tr>';
    tr += '<td>' + (i+1) + '</td>';
    tr += '<td title="' + epMoment.format('LLL') + '">' + epMoment.format('ll') + '</td>';

    var featuredIndex = Math.floor((Math.random() * episode.views.length));
    var feature = episode.views[featuredIndex];

    tr += '<td><a class="btn btn-primary btn-xs show-archives-tr-feature-link" href="' + youtubeLink(feature.yt) + '" title="' + getPersonById(feature.by).displayName + '"><span class="glyphicon glyphicon-play"></span> Watch</a></td>';

    episode.views.sort(compareShowViews);

    var perspectives = "";
    for (var j = 0; j < show.people.length; j++) {
      var by = show.people[j];
      if (!isPersonInViews(by, episode.views)) {
        perspectives += getArchiveLinkForView(null);
        continue;
      }
      var view = getViewByPerson(by, episode.views);
      perspectives += getArchiveLinkForView(view);
    }

    for (var j = 0; j < episode.views.length; j++) {
      var view = episode.views[j];
      if (show.people.indexOf(view.by) == -1) {
        perspectives += getArchiveLinkForView(view);
      }
    }

    tr += '<td>' + perspectives + '</td>';
    tr += '</tr>';
    tableRows += tr;
  }

  tableBody.html(tableRows);

});

function getArchiveLinkForView(view) {
  if (view == null) {
    return '<span class="show-archives-tr-view-link"><span class="show-archives-tr-view-icon playerpic-24 null_player"></span></span>'
  }
  var viewStr = "";
  viewStr += '<a href="';
  viewStr += youtubeLink(view.yt);
  viewStr += '" target="_blank" class="show-archives-tr-view-link" title="';
  viewStr += getPersonById(view.by).displayName;
  viewStr += '"><span class="show-archives-tr-view-icon playerpic-24 ';
  viewStr += view.by;
  viewStr += '"></span></a>';
  return viewStr;
}


$(".show-archives-modal").tooltip({
  placement: 'bottom',
  selector: '.show-archives-tr-view-link'/*, .show-archives-tr-feature-link'*/,
  trigger: 'hover'
});




function onNotImplementedFeature() {
  alert("Sorry, you can't do that yet. This website is merely a proof of concept, so not all the features have been implemented.");
}

function linkYoutubeChannel(id) {
  return "//youtube.com/user/" + id;
}

function youtubeLink(yt) {
  return "//youtube.com/watch?v=" + yt;
}

function youtubeHqThumbnail(yt) {
  return "//img.youtube.com/vi/"+yt+"/hqdefault.jpg";
}

function youtubeMqThumbnail(yt) {
  return "//img.youtube.com/vi/"+yt+"/mqdefault.jpg";
}

function prettyDate(date) {
  return moment(date).format('LL');
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
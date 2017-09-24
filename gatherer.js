// This file is a part of doom-trooper-browser project.

var data = [];
var output = [];

var refineSearchPopup;
var howtoPopup;
var resultsContainer;

var config = {
    defaultConfig : {
        'set' : {
            'LIM': 1,
            'INQ': 1,
            'APO': 1,
            'GOL': 1,
            'WAR': 1,
            'PAR': 1
        },
        'affiliation' : {
            'Bauhaus' : 1, 
            'Bractwo' : 1, 
            'Capitol': 1,
            'Imperial': 1,
            'Ogólna': 1,
            'Cybertronic': 1, 
            'Legion Ciemności' : 1,
            'Mishima': 1,
            'Hordy Półksiężyca' : 1,
            'Templariusze' : 1, 
            'Luterańska Triada': 1,
            'Synowie Rasputina' : 1
        },
        'rarity' : {'Common': 1, 'Uncommon' : 1, 'Rare' : 1},
        'type' : {
            'Wojownik' : 1,
            'Ekwipunek' : 1,
            'Specjalna' : 1,
            'Sztuka': 1,
            'Mroczna Harmonia': 1,
            'Umocnienia' : 1,
            'Misja': 1,
            'Relikt' : 1,
            'Moc Ki' : 1,
            'Sojusz' : 1,
            'Strefa Walki' : 1,
            'Stwór' : 1
        }
    },
    filters : {},
    size : 180,
    zoom : 240,
    sortable : [ 'set', 'name', 'affiliation', 'type', 'rarity', 'artist' ],
    sortableSpecial : [ 'set', 'affiliation', 'rarity', 'type' ],
    refineSearchVisible : 0,
    howtoPopupVisible : 0,
    page : 1,
    pages : 1,
    pageSize : 20
};

function initializeOrdering() {
    config.ordering = {};
    for(var orderCriteriaName in config.defaultConfig) {
        config.ordering[orderCriteriaName] = [];
        for (var orderCriteriaElement in config.defaultConfig[orderCriteriaName]) {
            config.ordering[orderCriteriaName].push(orderCriteriaElement);
        }
    }
}

function restoreConfig() {   
    if (typeof(Storage) !== "undefined") {
        if (localStorage.config) {
            config = JSON.parse(localStorage.config);
        } else {
            initializeOrdering();
        }
    }
}

function storeConfig() {
    if (typeof(Storage) !== "undefined") {
        localStorage.config = JSON.stringify(config);
    }
}

function resetConfig() {
    if (typeof(Storage) !== "undefined") {
        localStorage.clear();
    }
}


function xinspect(o, i)
{
    if (typeof i == 'undefined')
    {
        i = '';
    }
    if (i.length > 50)
        return '[MAX ITERATIONS]';
    var r = [];
    for (var p in o) {
        var t = typeof o[p];
        r.push(i + '"' + p + '" (' + t + ') => ' + (t == 'object' ? 'object:' + xinspect(o[p], i + '  ') : o[p] + ''));
    }
    return r.join(i + '\n');
}

function debug(e, skip) {
    ep = xinspect(e);
    if (!skip) {
        alert(ep);
    }
    console.log(ep);
}


function zfill(str, num, chr) {
    var pad_char = typeof chr !== 'undefined' ? chr : '0';
    var pad = new Array(1 + num).join(pad_char);
    return (pad + str).slice(-pad.length);
}


function changePage(c) {
    newPage = config.page + c;
    if (newPage >= 1 && newPage <= config.pages) {
        config.page = newPage;
        displayOutput();
    }
}

function changeAbsolutePage(c) {
    newPage = c;
    if (newPage >= 1 && newPage <= config.pages) {
        config.page = newPage;
        displayOutput();
    }
}

function buildPager()
{
  let pager = document.createElement('span');
  pager.id = 'pager';
  for(var i = 1; i <= config.pages; i++)
  {
      let a = document.createElement('a');
      a.innerHTML = i;
      if (i == config.page)
      {
          a.style = 'font-weight: bold; text-decoration: underline;';
      }
      let x = i;
      a.addEventListener('click', function(ev){changeAbsolutePage(x);});
      pager.appendChild(a);
      pager.appendChild(document.createTextNode(' '));
  }
  return pager;
}

function hideshow() {
    if (config.refineSearchVisible == 1) {
        $(refineSearch).hide('drop');
    } else {
        $(refineSearch).show();
    }
    config.refineSearchVisible = (config.refineSearchVisible + 1) % 2;
}

function markClass(el)
{
    return { '0': 'unticked', '1': 'ticked' }[el];
}

function processJSON(setjson) {
    for (var j = 0; j < setjson.cards.length; j++) {
        var card = setjson.cards[j];
        card.set = setjson.code.toUpperCase();
        if (typeof(card.colors) === "undefined") {
            card.colors = [];
        }
        data.push(card);
    }
}

function initializeData() {
    for (var i in config.ordering.set) {
        $.ajax({
            dataType : 'json',
            url : ('sets/' + config.ordering.set[i].toUpperCase() + '.json'),
            success : processJSON,
            async : false
        });
    }
}

function getSwap(t, p, o) {
    var that = o;
    var typ = p;
    var group = t;
    var swap = function() {
        config.defaultConfig[group][typ] = (config.defaultConfig[group][typ] + 1) % 2;
        o.className = markClass(config.defaultConfig[group][typ]);
        storeConfig();
        updateOutput();
    };
    return swap;
}

function getOrder(line)
{
    return function(event, ui) {
        for (var i = 0; i < line.children.length; i++) {
            var p = line.children[i].id;
            config.ordering[line.id][i] = p;
        }
        displayOutput();
    };
}

function copyToClipboard(text)
{
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}


function callbackHoverOn(that, ui)
{
    return function() {
        if (that.hasClass('split')) {
            that.css('transform', 'rotate(90deg) scale(' + (ui.values[1] / ui.values[0]) + ')');
        } else if (that.hasClass('aftermath')) {
            that.css('transform', 'rotate(-90deg) scale(' + (ui.values[1] / ui.values[0]) + ')');
        } else {
            that.css('transform', 'scale(' + (ui.values[1] / ui.values[0]) + ')');
        }
        that.css('z-index', 7);
        that.on('click', function () {
            that.css('transform', 'rotate(0deg) scale(1)');
            that.css('z-index', 0);
        });
    };
}

function callbackHoverOff(that)
{
    return function() {
        that.css('transform', 'rotate(0deg) scale(1)');
        that.css('z-index', 0);
    };
}

function resizeCards(ev, ui)
{
    $(".cardimg")
        .each(function(i, el) {
            $(el).width(ui.values[0] + 'px');
            $(el).height(ui.values[0] * 40 / 29 + 'px');
            $(el).hover(
                callbackHoverOn($(this), ui),
                callbackHoverOff($(this))
            );
            $(el).mousedown(function(ev) {
                if (ev.which == 3) {
                    copyToClipboard(el.alt);
                }
            });
        });
    config.size = ui.values[0];
    config.zoom = ui.values[1];
    storeConfig();
}


function buildButtonReset()
{
    var buttonReset = document.createElement('button');

    buttonReset.innerHTML = 'Reset';
    buttonReset.addEventListener('click', function () {
        resetConfig();
        location.reload();
    });
    $(buttonReset).button();

    return buttonReset;
}

function buildButtonFilter()
{
    var buttonFilter = document.createElement('button');

    buttonFilter.innerHTML = 'Filter';
    buttonFilter.addEventListener('click', function () {
        config.refineSearchVisible = (config.refineSearchVisible + 1) % 2;
        if (config.refineSearchVisible == 0) {
            $(refineSearchPopup).dialog("close");
        } else {
            $(refineSearchPopup).dialog("open");
        }
    });
    $(buttonFilter).button();

    return buttonFilter;
}

function buildHowToButton()
{
    var howtoButton = document.createElement('button');

    howtoButton.innerHTML = 'HowTo';
    howtoButton.addEventListener('click', function () {
        config.howtoPopupVisible = (config.howtoPopupVisible + 1) % 2;
        if (config.howtoPopupVisible == 0) {
            $(howtoPopup).dialog("close");
        } else {
            $(howtoPopup).dialog("open");
        }
    });
    $(howtoButton).button();

    return howtoButton;
}


function buildButtonPrevious()
{
    var buttonPrevious = document.createElement('button');

    buttonPrevious.innerHTML = '&lt;&lt;';
    buttonPrevious.addEventListener('click', function () {
        changePage(-1);
    });
    $(buttonPrevious).button();

    return buttonPrevious;
}

function buildButtonNext()
{
    var buttonNext = document.createElement('button');

    buttonNext.innerHTML = '&gt;&gt;';
    buttonNext.addEventListener('click', function () {
        changePage(1);
    });
    $(buttonNext).button();

    return buttonNext;
}

function buildPaginationInfo() {
    var paginationInfo = document.createElement('button');

    paginationInfo.id = 'pagination';
    $(paginationInfo).button().click(function(event) { event.preventDefault(); });

    return paginationInfo;
}

function buildButtons()
{
    var buttons = document.createElement('div');

    buttons.appendChild(buildHowToButton());
    buttons.appendChild(buildButtonReset());
    buttons.appendChild(buildButtonFilter());
    buttons.appendChild(buildButtonPrevious());
    buttons.appendChild(buildPaginationInfo());
    buttons.appendChild(buildButtonNext());

    return buttons;
}

function buildCardResizeSlider()
{
    var cardResizerSlider = document.createElement('div');

    cardResizerSlider.className = 'cardResizerSlider';
    $(cardResizerSlider)
        .slider({range: true, min: 50, max: 480, values: [config.size, config.zoom], slide: resizeCards});

    return cardResizerSlider;
}

function buildRefineSearchOmnibox()
{
    var refineSearchOmnibox = document.createElement('textarea');

    refineSearchOmnibox.className = 'omni';
    if (typeof config.filters.omni != "undefined") {
        refineSearchOmnibox.value = config.filters.omni;
    }
    refineSearchOmnibox.addEventListener('keyup', function () {
        if (refineSearchOmnibox.value.length > 2) {
            config.filters.omni = refineSearchOmnibox.value;
            updateOutput();
        } else if (typeof config.filters.omni != "undefined") {
            delete config.filters.omni;
            updateOutput();
        }
    });

    return refineSearchOmnibox;
}

function buildRefineSearchOrder()
{
    var refineSearchOrder = document.createElement('ul');

    refineSearchOrder.id = 'sortable';
    refineSearchOrder.className = 'sortable';
    for (var i in config.sortable) {
        el = document.createElement('li');
        el.innerHTML = config.sortable[i];
        el.id = 'sort' + config.sortable[i];
        refineSearchOrder.appendChild(el);
    }

    $(refineSearchOrder)
        .sortable({
            containment: 'document',
            stop: function (event, ui) {
                config.sortable = [];
                var children = refineSearchOrder.children;
                for (var i = 0; i < refineSearchOrder.children.length; i++) {
                    var p = children[i].id; //.attr('id').replace(/sort/, '');
                    config.sortable[i] = p.replace(/sort/, '')
                }
                displayOutput();
            }
        });
    $(refineSearchOrder).disableSelection();

    return refineSearchOrder;
}

function buildRefineSearchCriteriaLine(criteriaLineId) {
    var line = document.createElement('ul');
    line.className = 'sortable';
    line.id = criteriaLineId;

    var i = 0;
    for (var pi in config.ordering[criteriaLineId]) {
        p = config.ordering[criteriaLineId][pi];
        lineElement = document.createElement('li');
        lineElement.id = p;
        if (typeof static_image[criteriaLineId] === "undefined") {
            spanText = document.createElement('span');
            spanText.innerHTML = p;
            spanText.className = markClass(config.defaultConfig[criteriaLineId][p]);
            spanText.addEventListener('click', getSwap(criteriaLineId, p, spanText));
            lineElement.appendChild(spanText);
        } else {
            img = document.createElement('img');
            img.src = static_image[criteriaLineId][p];
            img.alt = config.defaultConfig[criteriaLineId][p];
            img.style.height = '32px';
            img.className = markClass(config.defaultConfig[criteriaLineId][p]);
            img.addEventListener('click', getSwap(criteriaLineId, p, img));
            lineElement.appendChild(img);
        }
        line.appendChild(lineElement);
        i = i + 1;
        if (i == 14) {
            i = 0;
            line.appendChild(document.createElement('br'));
        }
    }
    if (config.sortableSpecial.indexOf(criteriaLineId) != -1) {
        $(line).sortable({containment: 'document', stop: getOrder(line)});
        $(line).disableSelection();
    }

    return line;
}

function buildRefineSearchPopup()
{
    var refineSearchPopup = document.createElement('div');

    refineSearchPopup.appendChild(buildRefineSearchOrder());

    $(refineSearchPopup)
        .dialog({
            close: function () {
                config.refineSearchVisible = 0;
                storeConfig();
            }
        });
    $(refineSearchPopup).dialog('option', 'width', '700px');
    if (config.refineSearchVisible == 0) {
        $(refineSearchPopup).dialog("close");
    } else {
        $(refineSearchPopup).dialog("open");
    }

    for (var criteriaLineId in config.defaultConfig) {
        refineSearchPopup.appendChild(buildRefineSearchCriteriaLine(criteriaLineId));
    }

    return refineSearchPopup;
}

function buildHowToPopup()
{
    var howtoPopup = document.createElement('div');

    howtoPopup.innerHTML =
        "<h3>Slider:</h3>" +
        "<strong>resize</strong> the cards (left end: display size; right end: zoom on hover)" +
        "<h3>Omnibox:</h3>" +
        "<strong>filter</strong> results by name, text, type, artist etc. <br/>" +
        "<i>e.g.: 'heretyk', 'bohater', '4/4/4/4', 'Paul Bonner'</i><br/>" +
        "<strong>add an extra criteria</strong> on fight/shoot/armor/value<br/>" +
        "one per line and space separated, e.g.:<br/>" +
        "<i>fight > 3<br />shoot < 3</i>" +
        "<h3>Filter box:</h3>" +
        "<strong>precisie criteria</strong> by switching fields toggle-mode<br/>" +
        "(i.e. click once to hide, click twice to show criteria)<br/>" +
        "<strong>order them</strong> by drag-and-drop:<br/>" +
        "use first line to order generic criteria<br/>" +
        "(e.g. <i>type -> name -> ...</i>)<br/>" +
        "then precise the order of criteria per group<br/>" +
        "(e.g. <i>'Wojownik' -> 'Umocnienia' -> ...</i>)";

    $(howtoPopup)
        .dialog({
            close: function () {
                config.howtoPopupVisible = 0;
                storeConfig();
            }
        });    $(howtoPopup).dialog('option', 'width', '700px');
    if (config.howtoPopupVisible == 0) {
        $(howtoPopup).dialog("close");
    } else {
        $(howtoPopup).dialog("open");
    }

    return howtoPopup;
}

function buildAdditionalNavigationButtons()
{
  var additional_navigation_buttons = document.createElement('div');
  additional_navigation_buttons.style = 'clear: both;';

  additional_navigation_buttons.appendChild(buildButtonPrevious());
  additional_navigation_buttons.appendChild(buildPager());
  additional_navigation_buttons.appendChild(buildButtonNext());

  return additional_navigation_buttons;
}

function buildResultsContainer()
{
  return document.createElement('div');
}

function buildLineBreak()
{
  return document.createElement('br');
}

function buildRefineSearch()
{
  var refineSearch = document.createElement('div');

  refineSearch.appendChild(buildRefineSearchCriteria());

  return refineSearch;
}

function initializeDocument()
{
  resultsContainer = buildResultsContainer();
  resultsContainer.style = 'margin: auto';
  refineSearchPopup = buildRefineSearchPopup();
  howtoPopup = buildHowToPopup();

  document.body.appendChild(buildCardResizeSlider());
  document.body.appendChild(buildButtons());
  document.body.appendChild(buildRefineSearchOmnibox());
  document.body.appendChild(resultsContainer);
  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(buildAdditionalNavigationButtons());
}

function main()
{
    restoreConfig();
    initializeData();
    initializeDocument();
    updateOutput();
}



function sortSpecial(arr, ordarr) {
    arr.sort(function(a, b) {
        oa = ordarr.indexOf(a);
        ob = ordarr.indexOf(b);
        if (oa > ob && ob != -1) {
            return 1;
        } else {
            return -1;
        }
    });
    return arr;
}

function formatOutput(cards) {
    for (var i in config.sortable) {
        var f = config.sortable[config.sortable.length - i - 1];
        if (f == 'affiliation') {
            cards.sort(function(a, b) {
                if (config.ordering.affiliation.indexOf(a.affiliation) > config.ordering.affiliation.indexOf(b.affiliation)) {
                    return 1;
                } else {
                    return -1;
                }
            });
        } else if (f == 'type') {
            cards.sort(function(a, b) {
                if (config.ordering.type.indexOf(a.type) > config.ordering.type.indexOf(b.type)) {
                    return 1;
                } else {
                    return -1;
                }
            });
        } else if (config.sortableSpecial.indexOf(f) != -1) {
            if (typeof config.ordering[f] == 'undefined') {
                alert(f);
            }
            cards.sort(function(a, b) {
                if (config.ordering[f].indexOf(a[f]) > config.ordering[f].indexOf(b[f])) {
                    return 1;
                } else {
                    return -1;
                }
            });
        } else {
            if (f == 'name') {
                f = 'nazwa';
            }
                cards.sort(function(a, b) {
                    if (a[f] > b[f]) {
                    return 1;
                } else {
                    return -1;
                }
            });
        }
    }
    return cards;
}

function getlist(param) {
    ret = [];
    for (var k in config.defaultConfig[param]) {
        if (config.defaultConfig[param][k] == 1) {
            ret.push(k);
        }
    }
    return ret;
}

function intersect_safe(aa, bb) {
    var ai = 0, bi = 0;
    var result = new Array();
    var a = aa.slice();
    var b = bb.slice();
    a.sort();
    b.sort();
    while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) {
            ai++;
        } else if (a[ai] > b[bi]) {
            bi++;
        } else /* they're equal */
        {
            result.push(a[ai]);
            ai++;
            bi++;
        }
    }

    return result;
}

function intersection(a, b) { return intersect_safe(a, b).length != 0; }

function filterCard(card) {
    if (config.filters.sets.indexOf(card.set) == -1) {
        return false;
    }

    if (typeof config.filters.omni != "undefined") {
        text = card.nazwa + (card.text ? card.text : '') + card.type + card.affiliation + card.artist +
               (card.shoot ? (card.fight + '/' + card.shoot + '/' + card.armor + '/' + card.value) : '') +
               card.set;
        for (var i in config.filters.omnisplit) {
            if (text.toLowerCase().indexOf(config.filters.omnisplit[i].toLowerCase()) == -1) {
                return false;
            }
        }
        for (var i in config.filters.omnispec) {
            try {
                q = config.filters.omnispec[i];
                if (q[0] == 'cmc') {
                    q0 = card[q[0]] || 0;
                } else {
                    q0 = card[q[0]];
                }
                if (!q0) {
                    return false;
                }
                q2 = parseInt(q[2]);
                switch (q[1]) {
                case "<":
                    if (!(q0 < q2))
                        return false;
                    break;
                case ">":
                    if (!(q0 > q2))
                        return false;
                    break;
                case "<=":
                    if (!(q0 <= q2))
                        return false;
                    break;
                case ">=":
                    if (!(q0 >= q2))
                        return false;
                    break;
                case "=":
                    if (!(q0 == q2))
                        return false;
                    break;
                default:
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
    }
    if (card.affiliation.indexOf('/') == -1) {
    if (config.filters.affiliation.indexOf(card.affiliation) == -1) {
        return false;
    }}
    else {
        if (!intersection(config.filters.affiliation,card.affiliation.split('/')))
        {
            return false;
        }
    }
    if (config.filters.types.indexOf(card.type) == -1) {
        return false;
    }
    if (config.filters.rarity.indexOf(card.rarity) == -1) {
        return false;
    }

    return true;
}


function buildCard(jsonCard, language)
{
    var card_div = document.createElement('div');
    card_div.style = 'float: left;';
    var card = document.createElement('img');

    card.className = 'cardimg ' + jsonCard.layout;
    card.style.width = config.size + 'px';
    card.style.height = config.size * 40 / 29 + 'px';
    card.src = getCardImageUrl(jsonCard, language);
    card.alt = jsonCard.name;

    card_div.appendChild(card);
    return card_div;
}

function displayOutput() {
    cards = formatOutput(output);

    var first = config.pageSize * (config.page - 1);
    var last = Math.min(config.pageSize * config.page, cards.length);
    config.pages = Math.ceil(cards.length / config.pageSize);

    resultsContainer.innerHTML = '';

    for (var i = first; i < last; i++)
    {
        var jsonCard = cards[i];
        resultsContainer.appendChild(buildCard(jsonCard, null));
    }

    $('#pagination')
        .text(config.page + '/' + config.pages + ' (' + (first + 1) + '-' + last + '/' + cards.length + ')')
        .button("refresh");

    let oldPager = document.getElementById('pager');
    let oldPagerParent = oldPager.parentNode;
    let newPager = buildPager();

    oldPagerParent.replaceChild(newPager, oldPager);

    resizeCards(null, {values : [ config.size, config.zoom ]});
}

function updateOutput() {
    config.page = 1;
    config.pages = 1;
    output = [];

    config.filters.sets = getlist('set');
    config.filters.affiliation = getlist('affiliation');
    config.filters.types = getlist('type');
    config.filters.rarity = getlist('rarity');

    if (typeof config.filters.omni != 'undefined') {
        omnilines = config.filters.omni.split('\n');
        config.filters.omnisplit = [];
        config.filters.omnispec = [];
        for (var i in omnilines) {
            omnisplit = omnilines[i].split(' ');
            if (omnisplit.length == 3 && intersection(omnisplit, [ '<', '>', '<=', '>=', '=' ])) {
                config.filters.omnispec.push(omnisplit);
            } else {
                config.filters.omnisplit.concat(omnisplit);
                for (var i in omnisplit) {
                    config.filters.omnisplit.push(omnisplit[i]);
                }
            }
        }
    }

console.log(data);

    for (var i in data) {
        if (filterCard(data[i])) {
            output.push(data[i]);
      }
    }

    displayOutput();
};

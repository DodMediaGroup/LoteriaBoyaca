var api = "http://loteriadeboyaca.gov.co/api/";
//var api = "http://192.168.140.103/dodmediagroup/Loteria/LoteriaBoyaca/Web/api/";

var requestLoadAjax = new Array();
requestLoadAjax['home'] = false;
requestLoadAjax['news'] = false;

var pages = {
    'news':{
        'page':1,
        'load':true
    },
    'new':null,
    'results':{
        'load':true
    },
    'result':''
};

$(document).on('ready', function(){
	// PASAR IMAGENS SVG A FORMATO EDITABLE
	$('img.js-img-svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        $.get(imgURL, function(data) {
            var $svg = jQuery(data).find('svg');
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
            $svg = $svg.removeAttr('xmlns:a');
            $img.replaceWith($svg);
        }, 'xml');
    });

    $.loadAjax('home','$.loadHome',{},$('.my-loading'));
    $.loadAjax('news','$.loadNews',{page:pages.news.page},$('.my-loading'));

	// Cargar contenidos
    $( ":mobile-pagecontainer" ).on( "pagecontainerbeforechange", function( event, ui ) {
		var loading;
        
        if(ui.toPage[0].id == 'new'){
            if(pages.new == null)
                $( ":mobile-pagecontainer" ).pagecontainer( "change", "#news");
            else{
                $.loadAjax('new','$.loadNew',{new:pages.new},$('.my-loading'));
            }
        }
        else if(ui.toPage[0].id == 'result'){
            $.loadAjax('result','$.loadResult',{raffle:pages.result},$('.my-loading'));
        }
        if(ui.toPage[0].id == 'winner' && pages.results.load){
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#results");
            $( ":mobile-pagecontainer" ).pagecontainer( "show" );
        }

	});
    $( ":mobile-pagecontainer" ).on( "pagecontainershow", function( event, ui ) {
        var loading;

        if(ui.toPage[0].id == 'results'){
            if(pages.results.load)
                $.loadAjax('results','$.loadResults',{},$('.my-loading'));
        }
    });

    // Cargar Noticias
    $(window).on("scrollstop", function (e) {
        var activePage = $.mobile.pageContainer.pagecontainer("getActivePage"),
            scrolled = $(window).scrollTop(),
            screenHeight = $.mobile.getScreenHeight(),
            contentHeight = $(".ui-content", activePage).outerHeight(),
            header = $(".ui-header", activePage).outerHeight() - 1,
            footer = $(".ui-footer", activePage).outerHeight() - 1,
            
            scrollEnd = contentHeight - screenHeight + header + footer;

        if (activePage[0].id == "news" && pages.news.load && (scrolled >= scrollEnd || ($("#news .js-load-content").outerHeight() < 410)))
            $.loadAjax('news','$.loadNews',{page:pages.news.page},$('.my-load-content'));
    });

    // Mostrar Noticia
    $(document).on('click', "#news .js-link-new", function(event) {
        pages.new = $(this).attr('data-new');
    });

    // Mostrar Resultado
    $(document).on('click', '.js-link-raffle', function(event) {
        var go = true;

        if($(this).hasClass('check'))
            if($(this).attr('data-raffle') == '')
                go = false;

        if(go)
            pages.result = $(this).attr('data-raffle');
    });

    // Seleccionar Sorteo
    $(document).on('change', '#results #result_raffle', function(event) {
        event.preventDefault();

        var value = $(this).val();
        $('#results .js-link-raffle.check').attr('data-raffle',value);

        if(value != ""){
            $('#results .js-link-raffle.check').attr('href','#result');
            $('#results .js-link-raffle.check').parent().addClass('my-go-green');
        }
        else{
            $('#results .js-link-raffle.check').attr('href','#');
            $('#results .js-link-raffle.check').parent().removeClass('my-go-green');
        }
    });

    $(document).on('click', '.js-is-winner', function(event) {
        event.preventDefault();

        var raffle = $("#id_raffle_winner").val(),
            number = $('#winner .js-winner_number').val(),
            serie = $('#winner .js-winner_serie').val();

        if($.trim(raffle) == '' || $.trim(number) == '' || $.trim(serie) == '')
            $.showMessage('Debe completar todos los campos...');
        else{
            $.loadAjax('is_winner','$.winner',{raffle:raffle, number:number, serie:serie},$('.my-loading'));
        }
    });

    $(document).on('click', '.js-close', function(event) {
        event.preventDefault();

        $(this).parent().removeClass('active');
    });
});

// Cargar contenido
$.loadAjax = function(url, run, filter, loading){
    loading.addClass('active');
    requestLoadAjax[url] = true;

    $.ajax({
        data: filter,
        dataType: 'jsonp',
        url: api+'mobile_'+url,
        crossDomain: true,
        success: function(data){
            requestLoadAjax[url] = false;
            eval(run+'(data)');

            $.closeLoading(loading);
        },
        error: function(xhr, textStatus, error){
            requestLoadAjax[url] = false;
            $.closeLoading(loading);
        }
    });
}
// Cerrar Loading
$.closeLoading = function(loading){
    var close = true;
    $.each(requestLoadAjax, function(index, val) {
        if(val)
            close = false
    });

    if(close)
        loading.removeClass('active');
}
// Mostrar mensaje
$.showMessage = function(msj){
    $(".my-msj-show").text(msj);
    $(".my-msj-show").addClass('active');

    setTimeout(function() {
        $(".my-msj-show").removeClass('active');
    }, 3000);
}

// Cargar contenido Home
$.loadHome = function(data){
    $("#home #value-award-higher").html(data.award);
    $("#home #next-raffle").html(data.nextRaffle);
}

// Cargar noticias
$.loadNews = function(data){
    var item;

    $.each(data, function(index, dataNew) {
        item = $('<article>',{
            class:'my-item'
        }).append($('<div>',{
            class:'my-item-content'
        }).append($('<div>',{
            class:'my-item-image'
        }).css('backgroundImage','url('+dataNew.image+')')).append($('<div>',{
            class:'my-item-info'
        }).append($('<p>',{
            text:dataNew.date
        })).append($('<h1>',{
            text:dataNew.title
        })))).append($('<div>',{
            class:'my-go'
        }).append($('<a>',{
            class:'js-link-new'
        }).attr({
            'href':"#new",
            'data-new':dataNew.new
        })));

        $("#news .js-load-content").append(item);
    });

    if(data.length < 1)
        pages.news.load = false;
    else
        pages.news.page = pages.news.page + 1;
}

// Cargar Noticia
$.loadNew = function(data){
    $("#new .js-item-date").html(data.date);
    $("#new .js-item-title").html(data.title);
    $("#new .js-item-image").css('backgroundImage','url('+data.image+')');
    $("#new .js-item-new").html(data.new);
}

// Cargar contenido results
$.loadResults = function(datas){
    var header = $("#results .ui-header").outerHeight();
    var footer = $('#results .ui-footer').outerHeight();

    var page = $('.ui-page-active').outerHeight();

    var item = (page - (header + footer)) / 3;

    $('#results .my-item').each(function(){
        $(this).css('height',item);
    });

    var option;
    $(".js-result_raffle").html('');
    $.each(datas, function(index, data) {
        option = "<option value='"+data.raffle+"' "+((data.raffle == '')?'selected="selected"':'')+">"+data.number+" - "+data.date+"</option>"

        if(index == 1)
            $('#results .js-my-last-date').text(data.dateUp);

        $(".js-result_raffle").append(option);
    });
    $(".js-result_raffle").change();

    pages.results.load = false;
}

// Cargar Resultado
$.loadResult = function(data){
    var content = $("#result .js-result-awards");
    var awards;
    var winners;

    $("#result .js-result-raffle").text("SORTEO "+data.number);
    $("#result .js-result-date").text(data.date);

    content.html('');
    $.each(data.awards, function(index, award) {
        if(index == 0){
            var number = award.winners[0].number.split('');
            
            $("#result .js-result-higher").text(award.name+' $'+award.value+' Millones');
            $.each(number, function(key, val) {
                $("#result .js-ball-"+(key+1)).text(val);
            });
            $("#result .js-result-higher-info").text('Serie '+award.winners[0].serie).append($('<span>',{
                text: 'Ciudad: '+award.winners[0].city,
            }));
        }
        else{
            if(award.winners.length > 0){
                winners = $('<tbody>');
                $.each(award.winners, function(key, winner) {
                    winners.append($('<tr>').append($('<td>',{
                        text:winner.number
                    })).append($('<td>',{
                        text:winner.serie
                    })).append($('<td>',{
                        text:((award.quantity <= 5)?winner.city:award.gross_value)
                    })));
                });

                awards = $('<div>').append($('<h3>',{
                    text: award.quantity+' '+award.name+' $'+award.value+' Millones'
                })).append($('<table>').append($('<thead>').append($('<tr>').append($('<th>', {
                    text: 'Ganador'
                })).append($('<th>', {
                    text: 'Serie'
                })).append($('<th>',{
                    text: ((award.quantity <= 5)?'Ciudad':'Valor')
                })))).append(winners));

                content.append(awards);
            }
        }
    });
}

// Comprobar si es Ganador
$.winner = function(data){
    $('#winner .my-return-winner').addClass('active');
    if(data.winner){
        $('#winner .my-return-winner-image').removeClass('not-winner');
        $('#winner .my-return-winner-image').addClass('is-winner');
    }
    else{
        $('#winner .my-return-winner-image').removeClass('is-winner');
        $('#winner .my-return-winner-image').addClass('not-winner');
    }

    $("#id_raffle_winner").val('');
    $("#id_raffle_winner").change();
    $('#winner .js-winner_number').val('');
    $('#winner .js-winner_serie').val('');
}


/**
 * Create a mapping object that allows camel case parameters to be looked up
 * for their Hungarian counterparts. The mapping is stored in a private
 * parameter called `_hungaianMap` which can be accessed on the source object.
 *  @param {object} o
 *  @memberof DataTable#oApi
 */
function _fnHungarianMap ( o )
{
	var
		hungarian = 'a aa ao as b fn i m o s ',
		match,
		newKey,
		map = {};

	$.each( o, function (key, val) {
		match = key.match(/^([^A-Z]+?)([A-Z])/);

		if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
		{
			newKey = key.replace( match[0], match[2].toLowerCase() );
			map[ newKey ] = key;

			if ( match[1] === 'o' )
			{
				_fnHungarianMap( o[key] );
			}
		}
	} );

	o._hungaianMap = map;
}


/**
 * Convert from camel case parameters to Hungarian, based on a Hungarian map
 * created by _fnHungarianMap.
 *  @param {object} src The model object which holds all parameters that can be
 *    mapped.
 *  @param {object} user The object to convert from camel case to Hungarian.
 *  @param {boolean} force When set to `true`, properties which already have a
 *    Hungarian value in the `user` object will be overwritten. Otherwise they
 *    won't be.
 *  @memberof DataTable#oApi
 */
function _fnCamelToHungarian ( src, user, force )
{
	if ( ! src._hungaianMap )
	{
		_fnHungarianMap( src );
	}

	var hungarianKey;

	$.each( user, function (key, val) {
		hungarianKey = src._hungaianMap[ key ];

		if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
		{
			user[hungarianKey] = user[ key ];

			if ( hungarianKey.charAt(0) === 'o' )
			{
				_fnCamelToHungarian( src[hungarianKey], user[key] );
			}
		}
	} );
}


/**
 * Language compatibility - when certain options are given, and others aren't, we
 * need to duplicate the values over, in order to provide backwards compatibility
 * with older language files.
 *  @param {object} oSettings dataTables settings object
 *  @memberof DataTable#oApi
 */
function _fnLanguageCompat( oLanguage )
{
	var oDefaults = DataTable.defaults.oLanguage;

	/* Backwards compatibility - if there is no sEmptyTable given, then use the same as
	 * sZeroRecords - assuming that is given.
	 */
	if ( !oLanguage.sEmptyTable && oLanguage.sZeroRecords &&
		oDefaults.sEmptyTable === "No data available in table" )
	{
		_fnMap( oLanguage, oLanguage, 'sZeroRecords', 'sEmptyTable' );
	}

	/* Likewise with loading records */
	if ( !oLanguage.sLoadingRecords && oLanguage.sZeroRecords &&
		oDefaults.sLoadingRecords === "Loading..." )
	{
		_fnMap( oLanguage, oLanguage, 'sZeroRecords', 'sLoadingRecords' );
	}
}


/**
 * Browser feature detection for capabilities, quirks
 *  @param {object} oSettings dataTables settings object
 *  @memberof DataTable#oApi
 */
function _fnBrowserDetect( oSettings )
{
	// Scrolling feature / quirks detection
	var n = $(
		'<div style="position:absolute; top:0; left:0; height:1px; width:1px; overflow:hidden">'+
			'<div style="position:absolute; top:1px; left:1px; width:100px; overflow:scroll;">'+
				'<div id="DT_BrowserTest" style="width:100%; height:10px;"></div>'+
			'</div>'+
		'</div>')[0];

	document.body.appendChild( n );
	// IE6/7 will oversize a width 100% element inside a scrolling element, to
	// include the width of the scrollbar, while other browsers ensure the inner
	// element is contained without forcing scrolling
	oSettings.oBrowser.bScrollOversize = $('#DT_BrowserTest', n)[0].offsetWidth === 100 ? true : false;

	// In rtl text layout, some browsers (most, but not all) will place the
	// scrollbar on the left, rather than the right.
	oSettings.oBrowser.bScrollbarLeft = $('#DT_BrowserTest', n).offset().left !== 1 ? true : false;
	document.body.removeChild( n );
}


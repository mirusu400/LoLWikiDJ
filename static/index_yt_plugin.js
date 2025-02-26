/* 유튜브 플러그인 */
var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('video_player', {
		height: '360',
		width: '640',
		// videoId: 'XgpTCb-Zf1o',
		playerVars:{
			'autoplay': 1, 
			// 'controls': 0, 
			'enablejsapi': 1, 
			'modestbranding': 1, 
			'playsinline': 1, 
			'disablekb': 1
			},
		events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) 
{
	resize()

	// 로그인 요청
	g_player_ready = true

	if(location.search.indexOf('OBS') != -1)
	{
		login_id.value = 'OBS'
		login()
		return
	}

	var stored_nick = localStorage.getItem(g_storage_nick_key)
	if(stored_nick)
	{
		login_id.value = stored_nick
		login_remember_nick.checked = true
		login()
		return
	}

	if(g_nick)
	{
		console.log('onPlayerReady에서 login')
		socket.emit('login', g_nick)
	}

	player.setLoop(false)
}

function onPlayerStateChange(event) 
{
	/*
		event.data
			-1: 초기화
			 0: 종료
			 1: 재생
			 2: 일시중지
			 3: 버퍼링
			 4: -
			 5: 시그널
	*/

	 if(event.data == 1)
	 {
		if(g_current_duration > 0) // 생방(실시간) 일때는 싱크 맞추지 않음
		{
			var currentTime_s = player.getCurrentTime()
			var diff = Math.abs(currentTime_s - (Date.now() - g_cued_time_ms) / 1000)

			if(diff >= 0.5)
				player.seekTo((Date.now() - g_cued_time_ms) / 1000, true)

			livechat_hide()
		}
		else
		{
			if(g_current_video_id && g_current_video_id.indexOf('.m3u8') == -1)
				livechat_set_video_id(g_current_video_id) // 생방이면 라이브챗 켜기
			else
				livechat_hide()
		}

		SetVideoBlock(!g_current_video_id)
	 }

	 if(event.data == 2)
	 {
		 if(g_current_video_id && g_current_video_id.indexOf('.m3u8') == -1)
			player.playVideo()
	 }

	 if(event.data == 3)
	 {
		player.setPlaybackQuality(document.querySelector('[name=video_quality]:checked').value)
	 }

	if(event.data == 5)
	{
		SetVideoBlock(!g_current_video_id)
		hide_video_link()
		player.seekTo((Date.now() - g_cued_time_ms) / 1000, true)
	}
}
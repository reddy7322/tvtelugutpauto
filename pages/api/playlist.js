import fetch from 'cross-fetch';

// Function to generate M3U playlist
const generateM3U = async () => {
    let m3uStr = '';
    

    m3uStr = '#EXTM3U\n';
    m3uStr += '\n# Playlist generated using API\n';

    // Reduce the number of concurrent API calls
    const fetchChannelData = async (id) => {
        try {
            const response = await fetch(`https://lust.toxicify.pro/api/toxicify/${id}`);
            if (!response.ok) throw new Error(`Failed to fetch channel ID ${id}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const channel = data[0];
                const live = channel.live;

                m3uStr += `#EXTINF:-1 tvg-id="${live.id}" group-title="${live.genre}", ${live.title}\n`;
                m3uStr += `#EXTVLCOPT:http-user-agent=${live.hmac}\n`;
                m3uStr += `#EXTVLCOPT:http-cookie=${live.cookie}\n`;
                m3uStr += `#EXTVLCOPT:http-header-fields="Cookie: ${live.cookie}"\n`;
                m3uStr += `${live.mpd}\n\n`;
            }
        } catch (error) {
            console.error(`Error fetching data for channel ID ${id}:`, error);
        }
    };

    // Fetch channel data sequentially to avoid timeouts
    for (const id of channels) {
        await fetchChannelData(id);
    }

    return m3uStr;
};

// API route handler
export default async function handler(req, res) {
    try {
        const m3uString = await generateM3U();
        res.status(200).send(m3uString);
    } catch (error) {
        console.error('Error generating M3U playlist:', error);
        res.status(500).send('Error generating playlist');
    }
}

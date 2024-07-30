import fetch from 'cross-fetch';

// Function to generate M3U playlist
const generateM3U = async () => {
    let m3uStr = '';
    const channels = [635, 
250, 
355, 
516, 
359, 
145, 
361, 
352, 
1342, 
590, 
585, 
645, 
362, 
387, 
388, 
1168, 
636, 
252, 
128, 
1341, 
1073, 
268, 
358, 
596, 
146, 
320, 
160, 
225, 
49, 
274, 
83, 
349, 
430, 
266, 
1027, 
774, 
1099, 
1100, 
1118, 
1151, 
1194, 
1288, 
337, 
548, 
429, 
290, 
445, 
285, 
351, 
630]; // IDs of the channels to fetch

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

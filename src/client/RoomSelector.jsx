import React, {useState, useEffect} from 'react';

export default ({socket, joinRoom, className}) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [shareURL, setShareURL] = useState('');
  const [roomName, setRoomName] = useState('');
  console.log(rooms, currentRoomId);

  useEffect(() => {
    socket.on('roomList', rooms => {
      console.log('got room list:', rooms);
      setRooms(rooms)
    });
    socket.emit('getRoomList');
  }, [socket])

  const shareRoom = () => {
    let url = new URL(window.location);
    url.hash = '#' + currentRoomId;
    setShareURL(url.href);
    copyToClipboard(url.href);
  }

  const createRoom = () => {
    if(!roomName) {
      return;
    }
    setRoomName('');
    socket.emit('createRoom', {name: roomName});
    socket.once('roomCreated', id => {
      console.log('Successfully created room');
      setCurrentRoomId(id);
    });
  }

  return <div className={`${className} room-selector`}>
    <div className="room-list-container">
      <h1>Public rooms</h1>
      <p>(click to join)</p>
    <div className="room-list">
    {rooms.map(room => <div key={room.id}>
      <span onClick={room.id !== currentRoomId ? (() => {
        joinRoom(room.id);
        setCurrentRoomId(null);
      }) : () => null}>
        {`${room.players}/${room.maxPlayers} ${room.name}${room.id === currentRoomId ? ' ◄' : ''}`}
      </span>
    </div>)}
    </div>
    </div>
      <div className={`create-room`}>
        <input type="text" value={roomName} onChange={ev => setRoomName(ev.target.value)} placeholder="Room name..." />
        <button type="button" onClick={createRoom}>Create a room</button>
      </div>
    <div className={`room-share${currentRoomId ? '' : ' hidden'}`}>
      <p>Created room Successfully!</p>
      <button type="button" className="share-room" onClick={shareRoom}>Copy link to clipboard</button>
      <p className={`copy-text${shareURL ? "" : " hidden"}`}>Copied!</p>
    </div>
  </div>
}

function copyToClipboard(str){
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

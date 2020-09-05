import React, {useState, useEffect} from 'react';

const RoomSelector = ({socket, joinRoom, className, userName}) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    socket.on('roomList', rooms => {
      console.debug('got room list:', rooms);
      setRooms(rooms);
    });
    socket.emit('getRoomList');
  }, [socket]);

  // eslint-disable-next-line no-unused-vars
  const shareRoom = () => {
    const url = new URL(window.location);
    url.hash = '#' + currentRoomId;
    copyToClipboard(url.href);
  };

  const createRoom = () => {
    if(!roomName){
      return;
    }
    setRoomName('');
    socket.emit('createRoom', {name: roomName});
    socket.once('roomCreated', id => {
      console.debug('Successfully created room');
      setCurrentRoomId(id);
    });
  };

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
  </div>;
};

function copyToClipboard(str){
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export default RoomSelector;

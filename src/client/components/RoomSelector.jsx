import React, {useState, useEffect, useRef} from 'react';

const RoomSelector = ({socket, joinRoom, className}) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const roomNameInput = useRef(null);

  // Focus room name on mount.
  useEffect(() => {
    roomNameInput.current.focus();
  }, []);

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

  const createRoom = ev => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    const {roomName} = Object.fromEntries(formData.entries());
    if(!roomName){
      return;
    }
    socket.emit('createRoom', {name: roomName});
    socket.once('roomCreated', id => {
      console.debug('Successfully created room');
      setCurrentRoomId(id);
    });
    roomNameInput.current.value = '';
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
    <form className={`create-room`} onSubmit={createRoom}>
      <input placeholder="Room name..." name="roomName" ref={roomNameInput} />
      <button type="submit">Create a room</button>
    </form>
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

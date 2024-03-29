import { useState, useEffect, useRef, FormEventHandler } from 'react';
import type { Socket } from 'socket.io-client';

type Room = {
  id: string,
  name: string,
  maxPlayers: number,
  players: number,
  isPublic: boolean,
}
const RoomSelector = ({ socket, joinRoom }: { socket: Socket, joinRoom: (id: string) => void }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const roomNameInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    socket.on('roomList', setRooms);
    socket.emit('getRoomList');
    return () => {
      socket.off('roomList');
    };
  }, [socket]);

  const shareRoom = () => {
    const url = new URL(window.location.href);
    url.hash = '#' + currentRoomId;
    copyToClipboard(url.href);
  };

  const createRoom: FormEventHandler<HTMLFormElement> = ev => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    const { isPrivate } = Object.fromEntries(formData.entries());
    socket.emit('createRoom', { name: roomName, isPublic: !isPrivate });
    socket.once('roomCreated', (id: string) => {
      setCurrentRoomId(id);
    });
    roomNameInput.current!.value = '';
  };

  return <div className="room-selector">
    <div className="room-list-container">
      <h1>Public rooms</h1>
      <p>(click to join)</p>
      <div className="room-list">
        {rooms.map(room => <div key={room.id}>
          <span onClick={room.id !== currentRoomId ? (() => {
            joinRoom(room.id);
            setCurrentRoomId(null);
          }) : () => null}>
            {`${room.players}/${room.maxPlayers} ${room.name}${room.id === currentRoomId ? ' ◄' : ''}${!room.isPublic ? '   (private)' : ''}`}
          </span>
        </div>)}
      </div>
    </div>
    {!currentRoomId ?
      <form className={`create-room`} onSubmit={createRoom}>
        <input placeholder="Room name..."
          autoFocus
          maxLength={50}
          name="roomName"
          ref={roomNameInput}
          className="neon-border"
          onInput={ev => setRoomName(ev.currentTarget.value.trim())} />
        <span>
          <button type="submit">Create a room</button>
          <label className="private-label ml">Private
            <input type="checkbox" name="isPrivate" />
          </label>
        </span>
      </form>
      :
      <div className="d-flex flex-column p m room-id-container neon-border">
        <p className="mt-0">Room ID: {currentRoomId}</p>
        <button onClick={shareRoom}>Copy link to clipboard</button>
      </div>
    }
  </div>;
};

function copyToClipboard(str: string){
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export default RoomSelector;

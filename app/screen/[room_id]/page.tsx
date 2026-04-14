import ScreenClient from './ScreenClient'

export default function ScreenPage({ params }: { params: { room_id: string } }) {
  return <ScreenClient roomId={params.room_id} />
}

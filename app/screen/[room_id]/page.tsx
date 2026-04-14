import ScreenClient from './ScreenClient'

export default function ScreenPage({ params }: { params: { room_id: string } }) {
  return (
    <>
      <style>{`html, body { height: 100%; overflow: hidden; margin: 0; padding: 0; }`}</style>
      <ScreenClient roomId={params.room_id} />
    </>
  )
}

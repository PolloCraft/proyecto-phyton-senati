import SectionTitle from "../../components/common/SectionTitle";

function ClasificarAudios() {
  return (
    <section className="page">
      <div className="page-inner">
        <SectionTitle subtitle="Clasifica y analiza archivos de audio con IA">
          Clasificar Audios
        </SectionTitle>

        <div className="tm-container" style={{ padding: 0, overflow: "hidden", border: "none" }}>
          <iframe
            src="/audio_classifier.html"
            title="Clasificar Audios"
            className="audio-iframe"
          />
        </div>
      </div>
    </section>
  );
}

export default ClasificarAudios;

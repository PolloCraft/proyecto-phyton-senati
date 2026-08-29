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
            style={{
              width: "100%",
              height: "500px",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default ClasificarAudios;

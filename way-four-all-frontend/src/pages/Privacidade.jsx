export default function Privacidade() {
  return (
    <main className="container page narrow prose">
      <span className="eyebrow">TRANSPARÊNCIA</span>
      <h1>Privacidade e uso</h1>
      <section className="panel">
        <h2>O que é usado pelo aplicativo</h2>
        <p>
          O cadastro usa nome, e-mail e senha. A API armazena a senha protegida
          por hash. O navegador guarda o token da sessão para autenticar suas
          ações.
        </p>
        <h2>Suas contribuições</h2>
        <p>
          Avaliações aprovadas exibem seu nome e comentário publicamente.
          Solicitações de alteração são analisadas pela administração. Não
          inclua informações pessoais sensíveis nos textos públicos.
        </p>
        <h2>Preferências neste dispositivo</h2>
        <p>
          As preferências de acessibilidade são opcionais e ficam neste
          navegador, separadas por conta. Você pode alterá-las em Minha conta ou
          removê-las limpando os dados do site.
        </p>
        <h2>Mapas e serviços externos</h2>
        <p>
          O mapa carrega imagens do OpenStreetMap. Ao abrir um trajeto, você
          acessa o Google Maps, sujeito às condições desse serviço. O aplicativo
          não acompanha sua localização em segundo plano.
        </p>
        <h2>Uso responsável</h2>
        <p>
          Compartilhe informações verdadeiras, respeite as pessoas e confirme as
          condições de acesso antes da visita. Para questões sobre sua conta e seus dados, procure a equipe responsável pelo projeto.
        </p>
      </section>
    </main>
  );
}

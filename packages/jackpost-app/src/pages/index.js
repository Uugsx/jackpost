import Jackpost from './Jackpost';
import GlobalStyle from '../globalStyles';
import '../i18n';
import Main from './Main';

export default function App() {
  return (
    <div>
      <main>
        <Main>
          <GlobalStyle />
          <Jackpost />
        </Main>
      </main>
    </div>
  );
}

import streamlit as st
import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import Ollama
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

# 1. Configuración de la página (Más estilo ChatGPT)
st.set_page_config(page_title="Chat UdeM", page_icon="🎓")

# CSS para limpiar la interfaz y parecerse a ChatGPT
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# 2. Barra lateral limpia con el logo
with st.sidebar:
    if os.path.exists("logo.png"):
        st.image("logo.png", use_container_width=True)
    else:
        st.markdown("### 🎓 UdeM AI")
    
    st.write("---")
    st.caption("💡 **Tip:** Pregúntame sobre el reglamento, las clases o la vida en el campus.")

st.title("Compañero UdeM")

# 3. El Cerebro Nica (Prompt Template)
template = """Eres un estudiante nicaragüense muy amigable, relajado y servicial que estudia en la Universidad de Managua (UdeM).
Estás chateando con un compañero o alguien interesado en la universidad.

REGLAS IMPORTANTES:
1. Habla como un joven de Nicaragua. Usa expresiones muy naturales como "broder", "ideay", "fresco", "clase de...", "dale", "mae", etc., pero sin exagerar.
2. Mantén un tono de "estudiante a estudiante", de tú a tú.
3. Usa la información del siguiente contexto para responder.
4. Si te saludan (ej. "hola", "¿qué onda?"), responde el saludo con energía nica antes de dar información.
5. Si te preguntan algo de la vida estudiantil que NO está en el texto, inventa una excusa realista de estudiante para decir que no sabes (ej. "Ala broder, de esa clase no sé mucho porque no la he metido, pero podés ir a preguntar a registro...").

Contexto de la UdeM: {context}

Conversación del usuario: {question}

Tu respuesta como estudiante nica:"""

QA_CHAIN_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)

# 4. Función para cargar el cerebro
@st.cache_resource
def cargar_cerebro_ia():
    documentos = []
    if os.path.exists('./datos'):
        # Instrucción estricta de UTF-8 para evitar errores de tildes
        loader_txt = DirectoryLoader('./datos', glob="**/*.txt", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
        documentos.extend(loader_txt.load())
        
        loader_pdf = DirectoryLoader('./datos', glob="**/*.pdf", loader_cls=PyPDFLoader)
        documentos.extend(loader_pdf.load())

    if not documentos:
        return None

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    textos = text_splitter.split_documents(documentos)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectordb = Chroma.from_documents(documents=textos, embedding=embeddings, persist_directory="./chroma_db")

    llm = Ollama(model="llama3")
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm, 
        chain_type="stuff", 
        retriever=vectordb.as_retriever(),
        chain_type_kwargs={"prompt": QA_CHAIN_PROMPT} 
    )
    return qa_chain

qa_chain = cargar_cerebro_ia()

if qa_chain is None:
    st.warning("⚠️ Faltan los datos. Agrega tus archivos a la carpeta 'datos'.")
else:
    if "mensajes" not in st.session_state:
        st.session_state.mensajes = [{"rol": "assistant", "contenido": "¿Qué onda broder? ¿En qué te ayudo hoy con las cosas de la UdeM?"}]

    for mensaje in st.session_state.mensajes:
        avatar = "👤" if mensaje["rol"] == "user" else "🎓"
        with st.chat_message(mensaje["rol"], avatar=avatar):
            st.markdown(mensaje["contenido"])

    pregunta = st.chat_input("Escribe tu mensaje aquí...")

    if pregunta:
        with st.chat_message("user", avatar="👤"):
            st.markdown(pregunta)
        st.session_state.mensajes.append({"rol": "user", "contenido": pregunta})

        with st.chat_message("assistant", avatar="🎓"):
            with st.spinner("Pensando..."):
                respuesta = qa_chain.invoke(pregunta)
                texto_respuesta = respuesta['result']
                st.markdown(texto_respuesta)
                
        st.session_state.mensajes.append({"rol": "assistant", "contenido": texto_respuesta})
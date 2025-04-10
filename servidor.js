const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://angelica:strongpassword@cardapio.ktl0dsm.mongodb.net/?retryWrites=true&w=majority&appName=Cardapio";
const client = new MongoClient(uri);

async function connectDB() {
    await client.connect();
    return client.db("CardapioDB");
}

// Criar nova categoria (evita duplicatas)
app.post("/categorias", async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome da categoria é obrigatório." });

    const db = await connectDB();
    const categoriaExistente = await db.collection("categorias").findOne({ nome });

    if (categoriaExistente) {
        return res.status(400).json({ error: "Categoria já existe!" });
    }

    const result = await db.collection("categorias").insertOne({ nome });
    res.json({ _id: result.insertedId, nome, message: "Categoria cadastrada com sucesso!" });
});

// Listar todas as categorias
app.get("/categorias", async (req, res) => {
    const db = await connectDB();
    const categorias = await db.collection("categorias").find().toArray();
    res.json(categorias);
});

// Excluir categoria
app.delete("/categorias/:id", async (req, res) => {
    const { id } = req.params;
    const db = await connectDB();
    await db.collection("categorias").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Categoria excluída com sucesso!" });
});

// Criar prato associando a uma categoria existente
app.post("/pratos", async (req, res) => {
    const { nome, preco, categoriaId, restaurant_id } = req.body;

    if (!nome || !preco || !categoriaId || !restaurant_id) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    const db = await connectDB();
    const categoria = await db.collection("categorias").findOne({ _id: new ObjectId(categoriaId) });

    if (!categoria) return res.status(400).json({ error: "Categoria não encontrada." });

    const result = await db.collection("pratos").insertOne({ 
        nome, 
        preco: parseFloat(preco), 
        categoria: categoria.nome, 
        restaurant_id 
    });

    res.json({ _id: result.insertedId, nome, preco, categoria: categoria.nome, restaurant_id, message: "Prato cadastrado com sucesso!" });
});

// Listar todos os pratos
app.get("/pratos", async (req, res) => {
    const db = await connectDB();
    const pratos = await db.collection("pratos").find().toArray();
    res.json(pratos);
});

// Excluir prato
app.delete("/pratos/:id", async (req, res) => {
    const { id } = req.params;
    const db = await connectDB();
    await db.collection("pratos").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Prato excluído com sucesso!" });
});

// Atualizar preço do prato
app.put("/pratos/:id/preco", async (req, res) => {
    const { id } = req.params;
    const { preco } = req.body;

    const db = await connectDB();
    await db.collection("pratos").updateOne(
        { _id: new ObjectId(id) },
        { $set: { preco: parseFloat(preco) } }
    );

    res.json({ message: "Preço atualizado com sucesso!" });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000!"));

function showSection(section) {
    const pratosSection = document.getElementById("pratosSection");
    const categoriasSection = document.getElementById("categoriasSection");
    const btnPratos = document.getElementById("btnPratos");
    const btnCategorias = document.getElementById("btnCategorias");

    // Mostrar a seção selecionada
    if (section === "pratos") {
        pratosSection.style.display = "block";
        categoriasSection.style.display = "none";
        btnPratos.classList.add("active");
        btnCategorias.classList.remove("active");
    } else {
        pratosSection.style.display = "none";
        categoriasSection.style.display = "block";
        btnCategorias.classList.add("active");
        btnPratos.classList.remove("active");
    }
}

;


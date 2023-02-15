import { GithubUsers } from "./githubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
    // {
    //   login: "maykbrito",
    //   name: "Mayk Brito",
    //   public_repos: "76",
    //   followers: "120000",
    // },
    // {
    //   login: "diego3g",
    //   name: "Diego Fernandes",
    //   public_repos: "76",
    //   followers: "120000",
    // },
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login.toUpperCase() === username.toUpperCase());
      if (userExists) {
        throw new Error("Usuário ja cadastrado");
      }
      const user = await GithubUsers.search(username);
      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filtereEntries = this.entries.filter((entry) => entry.login !== user.login);

    this.entries = filtereEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");
      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();
      row.querySelector(".user img").src = `http://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar este usuario?");
        if (isOk) {
          this.delete(user);
        }
      };
      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/nicholassouto.png" alt="Imagem de nicholassouto" />
      <a href="https://github.com/nicholassouto" target="_blank">
        <p>Nicholas Souto</p>
        <span>nicholassouto</span>
      </a>
    </td>
    <td class="repositories">30</td>
    <td class="followers">1</td>
    <td>
      <button class="remove">&times;</button>
    </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}

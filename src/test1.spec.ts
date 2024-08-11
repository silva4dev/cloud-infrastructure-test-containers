import { DataSource } from "typeorm";
import { Product } from "./Product";
import { ProductService } from "./ProductService";
import { MySqlContainer } from "@testcontainers/mysql";

// // image não existir
//    - baixar a imagem
//    - inicializar o container
// // imagem já existir
//    - inicializar o container

test("create product", async () => {
  const mysqlContainer = await new MySqlContainer("mysql:8.0.30-debian")
    .withCommand(["--default-authentication-plugin=mysql_native_password"])
    .start();

  const dataSource = new DataSource({
    type: "mysql",
    host: mysqlContainer.getHost(),
    port: mysqlContainer.getMappedPort(3306),
    username: "test",
    password: "test",
    database: "test",
    synchronize: true,
    entities: [Product],
    logging: true
  });

  await dataSource.initialize();

  const productService = new ProductService(dataSource.getRepository(Product));

  const product = await productService.createProduct({
    name: "product",
    price: 100
  });

  expect(product).toEqual({
    id: expect.any(Number),
    name: "product",
    price: 100
  });
}, 200000);

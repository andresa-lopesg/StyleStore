using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiClientes.Migrations
{
    /// <inheritdoc />
    public partial class MoverParaSchemaApiClientes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Usuarios",
                newName: "Usuarios",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "ProdutoVariantes",
                newName: "ProdutoVariantes",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Produtos",
                newName: "Produtos",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Producoes",
                newName: "Producoes",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Pedidos",
                newName: "Pedidos",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "ItensPedido",
                newName: "ItensPedido",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Funcionarios",
                newName: "Funcionarios",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Clientes",
                newName: "Clientes",
                newSchema: "apiclientes");

            migrationBuilder.RenameTable(
                name: "Categorias",
                newName: "Categorias",
                newSchema: "apiclientes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Usuarios",
                schema: "apiclientes",
                newName: "Usuarios");

            migrationBuilder.RenameTable(
                name: "ProdutoVariantes",
                schema: "apiclientes",
                newName: "ProdutoVariantes");

            migrationBuilder.RenameTable(
                name: "Produtos",
                schema: "apiclientes",
                newName: "Produtos");

            migrationBuilder.RenameTable(
                name: "Producoes",
                schema: "apiclientes",
                newName: "Producoes");

            migrationBuilder.RenameTable(
                name: "Pedidos",
                schema: "apiclientes",
                newName: "Pedidos");

            migrationBuilder.RenameTable(
                name: "ItensPedido",
                schema: "apiclientes",
                newName: "ItensPedido");

            migrationBuilder.RenameTable(
                name: "Funcionarios",
                schema: "apiclientes",
                newName: "Funcionarios");

            migrationBuilder.RenameTable(
                name: "Clientes",
                schema: "apiclientes",
                newName: "Clientes");

            migrationBuilder.RenameTable(
                name: "Categorias",
                schema: "apiclientes",
                newName: "Categorias");
        }
    }
}

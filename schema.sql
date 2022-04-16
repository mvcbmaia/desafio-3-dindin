drop table if exists usuarios;

create table usuarios (
  id serial primary key,
  nome text not null,
  email text not null unique,
  senha text not null
);

drop table if exists categorias;

create table categorias (
  id serial primary key,
  descricao text not null
);

drop table if exists transacoes;

create table transacoes (
  id serial primary key,
  descricao text not null,
  valor int,
  data date,
  categoria_id int not null,
  usuario_id int not null,
  tipo text not null,
  foreign key (categoria_id) references categorias (id),
  foreign key (usuario_id) references usuarios (id)
);

insert into categorias (descricao) values ('Lazer'), ('Salário'), ('Transporte'), ('Mercado'), ('Assinaturas e Serviços');
{ pkgs ? import <nixpkgs> {} }:
let
  pyEnv = pkgs.python312.withPackages (ps: with ps; [
    mkdocs
  ]);
in
  pkgs.mkShellNoCC {
  packages = with pkgs; [
    nodejs_20 # Node JS
    corepack_20 # Needed for pnpm
    nodejs_20.pkgs.pnpm
    npm-check-updates # Update node dependencies
    pyEnv # Python environment
    shellcheck # Shell script linter
    shfmt # Shell script formatter
  ];
}

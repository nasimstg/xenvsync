{
  description = "xenvsync - Encrypt, commit, and inject .env secrets";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        version =
          if self ? shortRev then "git-${self.shortRev}"
          else if self ? rev then "git-${builtins.substring 0 8 self.rev}"
          else "git-local";
      in
      {
        packages.default = pkgs.buildGoModule {
          pname = "xenvsync";
          inherit version;
          src = ./.;
          vendorHash = null;

          ldflags = [
            "-s" "-w"
            "-X main.version=${version}"
          ];

          meta = with pkgs.lib; {
            description = "Encrypt, commit, and inject .env secrets — no cloud required";
            homepage = "https://github.com/nasimstg/xenvsync";
            license = licenses.mit;
            maintainers = [];
            mainProgram = "xenvsync";
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ go gopls golangci-lint ];
        };
      }
    );
}
